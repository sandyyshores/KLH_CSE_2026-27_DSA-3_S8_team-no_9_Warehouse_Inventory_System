# Warehouse Inventory System

A data-structure-driven application for efficient product management in large-scale warehouses. Solves three core problems — fast product lookup, low-stock detection, and supplier information retrieval — using hash tables, BST/AVL trees, min-heaps, and graphs.

## Author
Santhosh | Roll No. 2520030330 
Haadi | Roll No. 2520030297 
Shashank | Roll No. 2520030405


## Project status
🚧 Partial implementation — string matching and search module in progress.

## Features (planned)
- Constant-time product lookup via hash tables
- Range-based stock queries via BST/AVL trees
- Real-time low-stock detection via min-heap
- Supplier traversal and shortest procurement path via graphs

## Implemented so far
- [x] Repository setup
- [x] KMP (Knuth-Morris-Pratt) pattern matching — exact substring search on product names/SKUs
- [x] Fuzzy search — Levenshtein distance for typo-tolerant product search
- [x] Similarity scoring — [Levenshtein-based / Jaccard / cosine — whichever you used] for ranking close matches
- [ ] Hash table indexing
- [ ] BST/AVL range queries
- [ ] Min-heap low-stock tracking
- [ ] Supplier graph and shortest-path procurement

## Tech stack
- Language: Java (JDK 11+)
- IDE: [Eclipse / IntelliJ / VS Code]
