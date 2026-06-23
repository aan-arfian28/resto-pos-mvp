package websocket

import (
	"encoding/json"
	"log"
	"sync"
	"time"
)

const (
	bufferDuration = 5 * time.Minute
)

type PrintJob struct {
	OrderID     string       `json:"order_id"`
	TableNumber string       `json:"table_number,omitempty"`
	Items       []PrintItem  `json:"items"`
	Timestamp   time.Time    `json:"timestamp"`
	Channel     string       `json:"channel,omitempty"`
}

type PrintItem struct {
	Name     string `json:"name"`
	Quantity int    `json:"quantity"`
	Notes    string `json:"notes,omitempty"`
}

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	buffer     map[string][]PrintJob // channel -> buffered jobs
	mu         sync.RWMutex
}

func NewHub() *Hub {
	hub := &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		buffer:     make(map[string][]PrintJob),
	}
	go hub.run()
	go hub.cleanupBuffer()
	return hub
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			// Send buffered jobs for this client's channel
			if jobs, ok := h.buffer[client.channel]; ok {
				for _, job := range jobs {
					data, _ := json.Marshal(job)
					select {
					case client.send <- data:
					default:
					}
				}
				delete(h.buffer, client.channel)
			}
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			h.mu.RLock()
			delivered := false
			for client := range h.clients {
				if client.channel == "dapur" || client.channel == "all" {
					select {
					case client.send <- message:
						delivered = true
					default:
						// Client buffer full, will be dropped
					}
				}
			}
			h.mu.RUnlock()

			// If no kitchen client connected, buffer the job
			if !delivered {
				var job PrintJob
				if err := json.Unmarshal(message, &job); err == nil {
					h.mu.Lock()
					h.buffer["dapur"] = append(h.buffer["dapur"], job)
					h.mu.Unlock()
					log.Printf("No kitchen printer connected, buffering job for order %s", job.OrderID)
				}
			}
		}
	}
}

func (h *Hub) cleanupBuffer() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		h.mu.Lock()
		cutoff := time.Now().Add(-bufferDuration)
		for channel, jobs := range h.buffer {
			valid := make([]PrintJob, 0, len(jobs))
			for _, job := range jobs {
				if job.Timestamp.After(cutoff) {
					valid = append(valid, job)
				} else {
					log.Printf("Dropping expired print job for order %s (channel %s)", job.OrderID, channel)
				}
			}
			if len(valid) == 0 {
				delete(h.buffer, channel)
			} else {
				h.buffer[channel] = valid
			}
		}
		h.mu.Unlock()
	}
}

func (h *Hub) BroadcastPrintJob(channel string, job PrintJob) {
	job.Channel = channel
	job.Timestamp = time.Now()
	data, _ := json.Marshal(job)
	h.broadcast <- data
}
