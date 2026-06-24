package cache

import (
	"sync"
	"time"
)

type Entry struct {
	Body      []byte
	Header    string
	Status    int
	ExpiresAt time.Time
}

type Memory struct {
	mu    sync.RWMutex
	items map[string]Entry
}

func NewMemory() *Memory {
	return &Memory{items: make(map[string]Entry)}
}

func (m *Memory) Get(key string) (Entry, bool) {
	m.mu.RLock()
	entry, ok := m.items[key]
	m.mu.RUnlock()
	if !ok || time.Now().After(entry.ExpiresAt) {
		if ok {
			m.mu.Lock()
			delete(m.items, key)
			m.mu.Unlock()
		}
		return Entry{}, false
	}
	return entry, true
}

func (m *Memory) Set(key string, entry Entry) {
	m.mu.Lock()
	m.items[key] = entry
	m.mu.Unlock()
}

func (m *Memory) Count() int {
	m.mu.RLock()
	defer m.mu.RUnlock()
	now := time.Now()
	count := 0
	for _, entry := range m.items {
		if now.Before(entry.ExpiresAt) {
			count++
		}
	}
	return count
}

func (m *Memory) Clear() int {
	m.mu.Lock()
	defer m.mu.Unlock()
	count := len(m.items)
	m.items = make(map[string]Entry)
	return count
}
