interface Tab {
  label: string;
  to: string;
}

interface TopicConfig {
  tabs: Tab[];
  description: string;
}

// ─── 자료구조 ────────────────────────────────────────────────────────────────

export const arrayList: TopicConfig = {
  tabs: [
    { label: "Dynamic Array", to: "dynamic-array" },
    { label: "Singly Linked List", to: "singly-linked-list" },
    { label: "Doubly Linked List", to: "doubly-linked-list" },
    { label: "Circular Linked List", to: "circular-linked-list" },
  ],
  description:
    "배열과 연결 리스트는 가장 기본이 되는 선형 자료구조입니다.\n데이터를 메모리에 어떻게 배치하고 연결하느냐에 따라 접근·삽입·삭제의 시간 복잡도가 달라지며,\n이 차이를 이해하는 것이 자료구조 학습의 출발점입니다.",
};

export const stackQueue: TopicConfig = {
  tabs: [
    { label: "Stack", to: "stack" },
    { label: "Queue", to: "queue" },
    { label: "Circular Queue", to: "circular-queue" },
    { label: "Deque", to: "deque" },
  ],
  description:
    "스택과 큐는 데이터의 삽입·삭제 순서를 제어하는 선형 자료구조입니다.\n스택은 LIFO(후입선출), 큐는 FIFO(선입선출) 방식으로 동작하며, 다양한 알고리즘과 시스템 설계의 기반이 됩니다.",
};

export const hashTable: TopicConfig = {
  tabs: [
    { label: "Hash Function", to: "hash-function" },
    { label: "Collision Handling - Chaining", to: "chaining" },
    { label: "Collision Handling - Open Addressing", to: "open-addressing" },
  ],
  description:
    "해시 테이블은 키-값 쌍을 저장하며 평균 O(1)의 탐색·삽입·삭제를 제공하는 자료구조입니다.\n해시 함수의 설계와 충돌 처리 방식이 성능을 좌우하며, 실무에서 가장 빈번하게 활용되는 구조 중 하나입니다.",
};

export const tree: TopicConfig = {
  tabs: [
    { label: "Binary Tree", to: "binary-tree" },
    { label: "BST", to: "bst" },
    { label: "AVL Tree", to: "avl-tree" },
    { label: "Red-Black Tree", to: "red-black-tree" },
    { label: "B-Tree & B+ Tree", to: "b-tree" },
  ],
  description:
    "트리는 계층적 관계를 표현하는 비선형 자료구조입니다.\n이진 트리를 기반으로 탐색 효율을 높인 BST, 균형을 유지하는 AVL·Red-Black 트리, DB 인덱스에 쓰이는 B-Tree까지 다양한 변형이 존재합니다.",
};

export const heap: TopicConfig = {
  tabs: [
    { label: "Max Heap", to: "max-heap" },
    { label: "Min Heap", to: "min-heap" },
    { label: "Binary Heap", to: "binary-heap" },
    { label: "Priority Queue 구현 원리", to: "priority-queue" },
  ],
  description:
    "힙은 완전 이진 트리 기반의 자료구조로, 최솟값 또는 최댓값을 O(1)에 조회하고 O(log n)에 삽입·삭제합니다.\n우선순위 큐의 내부 구현으로 널리 사용됩니다.",
};

export const graph: TopicConfig = {
  tabs: [
    { label: "Adjacency Matrix", to: "adjacency-matrix" },
    { label: "Adjacency List", to: "adjacency-list" },
    { label: "Graph vs Tree", to: "graph-vs-tree" },
  ],
  description:
    "그래프는 정점(Vertex)과 간선(Edge)으로 이루어진 비선형 자료구조입니다.\n표현 방식(인접 행렬 vs 인접 리스트)에 따라 공간·시간 복잡도가 달라지며, DFS·BFS 탐색의 기반이 됩니다.",
};

export const trie: TopicConfig = {
  tabs: [
    { label: "Trie 구조 & 문자열 탐색 최적화", to: "trie-structure" },
    { label: "자료구조 특징 & 메모리 효율", to: "memory-efficiency" },
  ],
  description:
    "트라이는 문자열을 트리 형태로 저장해 접두사 탐색을 O(L)에 처리하는 자료구조입니다.\n자동완성, 사전 검색 등 문자열 집합을 다루는 문제에서 탁월한 성능을 발휘합니다.",
};

// ─── 알고리즘 ────────────────────────────────────────────────────────────────

export const bigO: TopicConfig = {
  tabs: [
    { label: "Big-O 표기법", to: "big-o-notation" },
    { label: "시간 복잡도 계산", to: "time-complexity" },
    { label: "공간 복잡도 계산", to: "space-complexity" },
    { label: "Amortized Analysis", to: "amortized" },
  ],
  description:
    "시간 복잡도와 공간 복잡도는 알고리즘의 효율성을 측정하는 핵심 지표입니다.\nBig-O 표기법으로 입력 크기에 따른 성능 변화를 표현하며, 이를 이해하는 것이 알고리즘 선택의 출발점입니다.",
};

export const sorting: TopicConfig = {
  tabs: [
    { label: "Bubble Sort", to: "bubble-sort" },
    { label: "Selection Sort", to: "selection-sort" },
    { label: "Insertion Sort", to: "insertion-sort" },
    { label: "Merge Sort", to: "merge-sort" },
    { label: "Quick Sort", to: "quick-sort" },
    { label: "Heap Sort", to: "heap-sort" },
    { label: "Radix Sort", to: "radix-sort" },
  ],
  description:
    "정렬은 데이터를 특정 기준에 따라 순서대로 나열하는 알고리즘입니다.\n각 알고리즘의 시간·공간 복잡도와 안정성(Stable) 여부를 이해하면 상황에 맞는 정렬 선택이 가능합니다.",
};

export const binarySearch: TopicConfig = {
  tabs: [
    { label: "Binary Search 원리", to: "binary-search" },
    { label: "Parametric Search", to: "parametric-search" },
  ],
  description:
    "이진 탐색은 정렬된 배열에서 O(log n)에 값을 찾는 탐색 알고리즘입니다.\nParametric Search로 확장하면 최적화 문제를 결정 문제로 변환해 효율적으로 풀 수 있습니다.",
};

export const hashSearch: TopicConfig = {
  tabs: [{ label: "Hash Table을 활용한 탐색 효율성", to: "hash-search" }],
  description:
    "해시 탐색은 해시 테이블을 이용해 평균 O(1)의 탐색 성능을 달성합니다.\n키를 해시 함수로 변환해 직접 접근하므로, 대규모 데이터에서도 빠른 탐색이 가능합니다.",
};

export const bruteForce: TopicConfig = {
  tabs: [
    { label: "Brute-force", to: "brute-force" },
    { label: "Recursion", to: "recursion" },
    { label: "Backtracking & N-Queen", to: "backtracking" },
  ],
  description:
    "완전 탐색은 가능한 모든 경우를 탐색해 정답을 찾는 방법입니다.\n재귀와 백트래킹을 통해 탐색 공간을 가지치기하면 불필요한 연산을 크게 줄일 수 있습니다.",
};

export const dfsBfs: TopicConfig = {
  tabs: [
    { label: "DFS", to: "dfs" },
    { label: "BFS", to: "bfs" },
  ],
  description:
    "DFS와 BFS는 그래프·트리를 순회하는 대표적인 탐색 알고리즘입니다.\nDFS는 스택/재귀로 깊이 우선 탐색, BFS는 큐로 너비 우선 탐색을 수행하며 문제 특성에 따라 선택합니다.",
};

export const dp: TopicConfig = {
  tabs: [
    { label: "Memoization", to: "memoization" },
    { label: "Tabulation", to: "tabulation" },
    { label: "Knapsack", to: "knapsack" },
    { label: "LCS", to: "lcs" },
  ],
  description:
    "동적 계획법은 큰 문제를 작은 부분 문제로 나누고 결과를 저장해 중복 계산을 없애는 기법입니다.\nMemoization(하향식)과 Tabulation(상향식) 두 가지 방식으로 구현합니다.",
};

export const greedy: TopicConfig = {
  tabs: [
    { label: "최적 부분 구조", to: "optimal-substructure" },
    { label: "탐욕적 선택 속성", to: "greedy-choice" },
    { label: "허프만 코딩", to: "huffman" },
  ],
  description:
    "그리디 알고리즘은 매 순간 지역적으로 최적인 선택을 해 전역 최적해를 구하는 방법입니다.\n최적 부분 구조와 탐욕적 선택 속성을 만족할 때 올바른 결과를 보장합니다.",
};

export const shortestPath: TopicConfig = {
  tabs: [
    { label: "Dijkstra", to: "dijkstra" },
    { label: "Bellman-Ford", to: "bellman-ford" },
    { label: "Floyd-Warshall", to: "floyd-warshall" },
  ],
  description:
    "최단 경로 알고리즘은 그래프에서 두 정점 사이의 가장 짧은 경로를 구합니다.\nDijkstra는 단일 출발점, Floyd-Warshall은 모든 쌍, Bellman-Ford는 음수 간선을 처리합니다.",
};

// ─── 네트워크 ────────────────────────────────────────────────────────────────

export const osi: TopicConfig = {
  tabs: [
    { label: "계층별 역할 & 프로토콜", to: "layers" },
    { label: "데이터 캡슐화", to: "encapsulation" },
  ],
  description:
    "OSI 7계층과 TCP/IP 4계층은 네트워크 통신 과정을 계층별로 분리해 표준화한 모델입니다.\n각 계층의 역할과 프로토콜, 데이터 캡슐화 과정을 이해하면 네트워크 동작 원리를 체계적으로 파악할 수 있습니다.",
};

export const tcpUdp: TopicConfig = {
  tabs: [
    { label: "연결 지향 vs 비연결 지향", to: "connection" },
    { label: "데이터 전송 방식 차이", to: "transmission" },
  ],
  description:
    "TCP는 연결 지향 프로토콜로 신뢰성 있는 데이터 전송을 보장하고, UDP는 비연결 지향으로 빠른 전송을 우선합니다.\n용도에 따라 적합한 프로토콜 선택이 중요합니다.",
};

export const handshake: TopicConfig = {
  tabs: [
    { label: "3-Way Handshake", to: "three-way" },
    { label: "4-Way Handshake", to: "four-way" },
  ],
  description:
    "TCP 연결은 3-Way Handshake로 설정되고 4-Way Handshake로 해제됩니다.\n각 단계의 SYN·ACK·FIN 플래그 교환 과정을 이해하면 TCP 연결 생명 주기를 명확히 파악할 수 있습니다.",
};

export const ip: TopicConfig = {
  tabs: [
    { label: "IPv4 & IPv6", to: "ipv4-ipv6" },
    { label: "Subnet Mask & CIDR", to: "subnet" },
    { label: "Public & Private IP", to: "public-private" },
  ],
  description:
    "IP 주소는 네트워크에서 장치를 식별하는 고유 주소입니다.\nIPv4의 주소 고갈 문제와 IPv6 전환, 서브네팅을 통한 네트워크 분할 방식을 다룹니다.",
};

export const http: TopicConfig = {
  tabs: [
    { label: "HTTP 메서드 & 상태 코드", to: "methods-status" },
    { label: "HTTP 1.1 / 2.0 / 3.0", to: "versions" },
    { label: "대칭키 & 공개키 암호화", to: "encryption" },
    { label: "SSL/TLS Handshake", to: "ssl-tls" },
  ],
  description:
    "HTTP는 웹 통신의 기반 프로토콜이며, HTTPS는 SSL/TLS를 통해 암호화된 통신을 제공합니다.\n버전별 개선 사항과 암호화 방식, TLS Handshake 과정을 이해하는 것이 핵심입니다.",
};

export const dns: TopicConfig = {
  tabs: [
    { label: "DNS 쿼리 과정", to: "dns-query" },
    { label: "L4 로드 밸런싱", to: "l4-lb" },
    { label: "L7 로드 밸런싱", to: "l7-lb" },
  ],
  description:
    "DNS는 도메인 이름을 IP 주소로 변환하는 시스템입니다.\n로드 밸런싱은 트래픽을 여러 서버에 분산해 가용성과 성능을 높이며, L4(전송 계층)와 L7(응용 계층) 방식으로 구분됩니다.",
};

export const auth: TopicConfig = {
  tabs: [
    { label: "Cookie", to: "cookie" },
    { label: "Session", to: "session" },
    { label: "Token (JWT)", to: "jwt" },
    { label: "인증 & 인가", to: "auth-authz" },
  ],
  description:
    "웹 인증은 Cookie·Session 기반의 서버 상태 저장 방식과 JWT 기반의 무상태 방식으로 나뉩니다.\n인증(Authentication)과 인가(Authorization)의 차이, 각 방식의 장단점을 함께 이해해야 합니다.",
};

// ─── 운영체제 ────────────────────────────────────────────────────────────────

export const processThread: TopicConfig = {
  tabs: [
    { label: "Process vs Thread 차이점", to: "process-thread" },
    { label: "PCB & TCB", to: "pcb-tcb" },
    { label: "Multi-Process vs Multi-Thread", to: "multi-process-thread" },
  ],
  description:
    "프로세스는 실행 중인 프로그램의 독립적인 인스턴스이고, 스레드는 프로세스 내에서 실행되는 작업 단위입니다.\n각각의 제어 블록(PCB·TCB)과 멀티 프로세스/스레드의 차이를 이해하면 운영체제 자원 관리의 핵심을 파악할 수 있습니다.",
};

export const cpuScheduling: TopicConfig = {
  tabs: [
    { label: "FCFS", to: "fcfs" },
    { label: "SJF", to: "sjf" },
    { label: "Round Robin (RR)", to: "round-robin" },
    { label: "Priority Scheduling", to: "priority-scheduling" },
    { label: "Multilevel Queue", to: "multilevel-queue" },
  ],
  description:
    "CPU 스케줄링은 여러 프로세스가 CPU를 효율적으로 공유할 수 있도록 실행 순서를 결정하는 기법입니다.\nFCFS·SJF·Round Robin 등 각 알고리즘의 동작 방식과 장단점을 비교하면 스케줄링 정책 선택의 기준을 이해할 수 있습니다.",
};

export const contextSwitching: TopicConfig = {
  tabs: [
    { label: "Context Switching 발생 조건", to: "condition" },
    { label: "Context Switching 오버헤드", to: "overhead" },
  ],
  description:
    "컨텍스트 스위칭은 CPU가 현재 실행 중인 프로세스/스레드의 상태를 저장하고 다음 것을 불러오는 과정입니다.\n발생 조건과 오버헤드를 이해하면 멀티태스킹 시스템의 성능 특성을 분석할 수 있습니다.",
};

export const synchronization: TopicConfig = {
  tabs: [
    { label: "Critical Section & Race Condition", to: "critical-section" },
    { label: "Mutex", to: "mutex" },
    { label: "Semaphore", to: "semaphore" },
    { label: "Monitor", to: "monitor" },
  ],
  description:
    "동기화는 여러 프로세스/스레드가 공유 자원에 안전하게 접근하도록 조율하는 메커니즘입니다.\n임계 구역과 경쟁 조건의 개념을 바탕으로 Mutex·Semaphore·Monitor의 차이를 이해하는 것이 핵심입니다.",
};

export const deadlock: TopicConfig = {
  tabs: [
    { label: "Deadlock 발생 조건 4가지", to: "conditions" },
    { label: "Deadlock 예방 (Prevention)", to: "prevention" },
    { label: "Deadlock 회피 (Avoidance)", to: "avoidance" },
    { label: "Deadlock 탐지 & 회복", to: "detection" },
  ],
  description:
    "교착 상태는 두 개 이상의 프로세스가 서로 상대방의 자원을 기다리며 무한 대기에 빠지는 상태입니다.\n발생 조건 4가지와 예방·회피·탐지·회복 전략을 이해하면 시스템 안정성 설계에 핵심 역할을 합니다.",
};

export const virtualMemory: TopicConfig = {
  tabs: [
    { label: "Paging (페이징)", to: "paging" },
    { label: "Segmentation (세그멘테이션)", to: "segmentation" },
    { label: "MMU (Memory Management Unit)", to: "mmu" },
    { label: "Thrashing", to: "thrashing" },
  ],
  description:
    "가상 메모리는 실제 물리 메모리보다 큰 주소 공간을 프로세스에 제공하는 기법입니다.\n페이징과 세그멘테이션으로 메모리를 분할하고, MMU가 주소를 변환하며, 과도한 페이지 교체가 발생하면 Thrashing이 일어납니다.",
};

export const pageReplacement: TopicConfig = {
  tabs: [
    { label: "FIFO", to: "fifo" },
    { label: "LRU", to: "lru" },
    { label: "LFU", to: "lfu" },
    { label: "NUR & Second Chance", to: "nur-second-chance" },
  ],
  description:
    "페이지 교체 알고리즘은 물리 메모리가 부족할 때 어떤 페이지를 내보낼지 결정합니다.\nFIFO·LRU·LFU·NUR의 동작 원리와 성능 차이를 이해하면 가상 메모리 시스템의 효율성을 높이는 방법을 파악할 수 있습니다.",
};

// ─── 데이터베이스 ────────────────────────────────────────────────────────────

export const rdbmsNoSql: TopicConfig = {
  tabs: [
    { label: "RDBMS 특징 & 설계 원칙", to: "rdbms" },
    { label: "NoSQL 특징 (Key-Value, Document, Column, Graph)", to: "nosql" },
    { label: "CAP 이론", to: "cap" },
    { label: "SQL vs NoSQL 선택 기준", to: "sql-vs-nosql" },
  ],
  description:
    "RDBMS는 스키마 기반의 관계형 데이터베이스로 강한 일관성을 보장하고, NoSQL은 유연한 스키마로 대규모 분산 환경에 적합합니다.\nCAP 이론과 각 DB 유형의 특성을 이해하면 서비스 요구사항에 맞는 데이터베이스를 선택할 수 있습니다.",
};

export const transaction: TopicConfig = {
  tabs: [
    { label: "Atomicity (원자성)", to: "atomicity" },
    { label: "Consistency (일관성)", to: "consistency" },
    { label: "Isolation (격리성)", to: "isolation" },
    { label: "Durability (지속성)", to: "durability" },
  ],
  description:
    "트랜잭션은 데이터베이스의 상태를 변환시키는 하나의 논리적 작업 단위입니다.\nACID 속성(원자성·일관성·격리성·지속성)을 모두 만족해야 데이터 무결성이 보장되며, 이는 모든 RDBMS 설계의 기본 원칙입니다.",
};

export const dbIsolation: TopicConfig = {
  tabs: [
    { label: "Read Uncommitted", to: "read-uncommitted" },
    { label: "Read Committed", to: "read-committed" },
    { label: "Repeatable Read", to: "repeatable-read" },
    { label: "Serializable", to: "serializable" },
    { label: "MVCC", to: "mvcc" },
  ],
  description:
    "격리 수준은 동시에 실행되는 트랜잭션들이 서로 얼마나 영향을 미치는지를 제어합니다.\nRead Uncommitted에서 Serializable로 갈수록 격리성이 높아지지만 성능은 낮아지며, MVCC는 잠금 없이 높은 동시성을 실현하는 기법입니다.",
};

export const dbIndex: TopicConfig = {
  tabs: [
    { label: "B-Tree 구조", to: "b-tree" },
    { label: "B+ Tree 구조", to: "b-plus-tree" },
    { label: "Clustered Index", to: "clustered-index" },
    { label: "Non-Clustered Index", to: "non-clustered-index" },
  ],
  description:
    "인덱스는 데이터 조회 속도를 높이기 위한 자료구조로, 대부분의 RDBMS는 B+ Tree를 기반으로 인덱스를 구현합니다.\nClustered Index와 Non-Clustered Index의 차이를 이해하면 쿼리 최적화와 설계에 직접 활용할 수 있습니다.",
};

export const normalization: TopicConfig = {
  tabs: [
    { label: "1NF", to: "1nf" },
    { label: "2NF", to: "2nf" },
    { label: "3NF", to: "3nf" },
    { label: "BCNF", to: "bcnf" },
    { label: "역정규화 (Denormalization) 성능 이점", to: "denormalization" },
  ],
  description:
    "정규화는 데이터 중복을 제거하고 무결성을 유지하기 위해 테이블을 분해하는 과정입니다.\n1NF·2NF·3NF·BCNF 단계별 규칙과, 성능을 위해 의도적으로 중복을 허용하는 역정규화 전략을 함께 이해해야 합니다.",
};

export const join: TopicConfig = {
  tabs: [
    { label: "Inner Join", to: "inner-join" },
    { label: "Outer Join", to: "outer-join" },
    { label: "Cross Join & Self Join", to: "cross-self-join" },
    { label: "Nested Loop Join", to: "nested-loop-join" },
    { label: "Hash Join", to: "hash-join" },
  ],
  description:
    "조인은 둘 이상의 테이블을 연결해 데이터를 조회하는 핵심 SQL 연산입니다.\n조인 종류(Inner·Outer·Cross·Self)와 실행 알고리즘(Nested Loop·Hash Join)의 동작 방식을 이해하면 쿼리 성능을 효과적으로 분석하고 최적화할 수 있습니다.",
};

export const anomaly: TopicConfig = {
  tabs: [
    { label: "삽입 이상 (Insertion Anomaly)", to: "insertion-anomaly" },
    { label: "삭제 이상 (Deletion Anomaly)", to: "deletion-anomaly" },
    { label: "갱신 이상 (Update Anomaly)", to: "update-anomaly" },
  ],
  description:
    "이상 현상은 정규화되지 않은 테이블에서 데이터를 삽입·삭제·갱신할 때 발생하는 의도치 않은 부작용입니다.\n삽입·삭제·갱신 이상의 원인을 이해하면 정규화 필요성과 적절한 테이블 설계 방향을 명확히 파악할 수 있습니다.",
};

// ─── 디자인 패턴 ─────────────────────────────────────────────────────────────

export const solid: TopicConfig = {
  tabs: [
    { label: "SRP (단일 책임 원칙)", to: "srp" },
    { label: "OCP (개방-폐쇄 원칙)", to: "ocp" },
    { label: "LSP (리스코프 치환 원칙)", to: "lsp" },
    { label: "ISP (인터페이스 분리 원칙)", to: "isp" },
    { label: "DIP (의존관계 역전 원칙)", to: "dip" },
  ],
  description:
    "SOLID는 객체지향 설계의 5가지 핵심 원칙입니다.\n각 원칙은 코드의 유지보수성·확장성·재사용성을 높이기 위한 지침으로, 클래스와 모듈을 어떻게 설계해야 하는지 구체적인 방향을 제시합니다.",
};

export const creational: TopicConfig = {
  tabs: [
    { label: "Singleton", to: "singleton" },
    { label: "Factory Method", to: "factory-method" },
    { label: "Abstract Factory", to: "abstract-factory" },
    { label: "Builder", to: "builder" },
    { label: "Prototype", to: "prototype" },
  ],
  description:
    "생성 패턴은 객체 생성 방식을 추상화해 유연성과 재사용성을 높이는 디자인 패턴입니다.\nSingleton·Factory Method·Abstract Factory·Builder·Prototype의 5종 패턴을 통해 생성 로직을 클라이언트로부터 분리할 수 있습니다.",
};

export const structural: TopicConfig = {
  tabs: [
    { label: "Adapter", to: "adapter" },
    { label: "Bridge", to: "bridge" },
    { label: "Composite", to: "composite" },
    { label: "Decorator", to: "decorator" },
    { label: "Facade", to: "facade" },
    { label: "Flyweight", to: "flyweight" },
    { label: "Proxy", to: "proxy" },
  ],
  description:
    "구조 패턴은 클래스와 객체를 더 큰 구조로 조합하는 방법을 정의하는 디자인 패턴입니다.\nAdapter·Bridge·Composite·Decorator·Facade·Flyweight·Proxy의 7종 패턴을 이해하면 복잡한 시스템을 유연하게 설계할 수 있습니다.",
};

export const behavioral: TopicConfig = {
  tabs: [
    { label: "Strategy", to: "strategy" },
    { label: "Observer", to: "observer" },
    { label: "State", to: "state" },
    { label: "Command", to: "command" },
    { label: "Template Method", to: "template-method" },
    { label: "Iterator", to: "iterator" },
    { label: "Visitor", to: "visitor" },
    { label: "Chain of Responsibility", to: "chain-of-responsibility" },
    { label: "Mediator", to: "mediator" },
    { label: "Memento", to: "memento" },
    { label: "Interpreter", to: "interpreter" },
  ],
  description:
    "행위 패턴은 객체 간의 알고리즘과 책임 분배를 다루는 디자인 패턴입니다.\nStrategy·Observer·State·Command 등 11종 패턴을 이해하면 객체들이 협력하는 방식을 유연하고 확장 가능하게 설계할 수 있습니다.",
};

export const mvcMvpMvvm: TopicConfig = {
  tabs: [
    { label: "MVC 패턴", to: "mvc" },
    { label: "MVP 패턴", to: "mvp" },
    { label: "MVVM 패턴", to: "mvvm" },
  ],
  description:
    "MVC·MVP·MVVM은 UI와 비즈니스 로직을 분리하는 아키텍처 패턴입니다.\n각 패턴의 구성 요소와 데이터 흐름 방식을 비교하면 프레임워크 선택과 코드 구조 설계에 올바른 판단을 내릴 수 있습니다.",
};
