// 역할: /cs 하위 라우트 정의. 주제마다 TopicLayout(탭) 아래 개요 · 세부 페이지를 둔다

import { Route } from "react-router-dom";
import CsHome from "@/container/client/cs/home";
import CsOverview from "@/component/client/cs/overview";
import CsContent from "@/container/client/cs/csContent";
import TopicLayout from "@/component/client/cs/topicLayout";
import {
  arrayList, stackQueue, hashTable, tree, heap, graph, trie,
  bigO, sorting, binarySearch, hashSearch, bruteForce, dfsBfs, dp, greedy, shortestPath,
  osi, tcpUdp, handshake, ip, http, dns, auth,
  processThread, cpuScheduling, contextSwitching, synchronization, deadlock, virtualMemory, pageReplacement,
  rdbmsNoSql, transaction, dbIsolation, dbIndex, normalization, join, anomaly,
  solid, creational, structural, behavioral, mvcMvpMvvm,
} from "@/types/cs/topics";

const csRoutes = (
  <>
    <Route path="/cs" element={<CsHome />} />

    {/* 자료구조 */}
    <Route path="/cs/ds/array-list" element={<TopicLayout tabs={arrayList.tabs} />}>
      <Route index element={<CsOverview description={arrayList.description} />} />
      <Route path="dynamic-array"        element={<CsContent />} />
      <Route path="singly-linked-list"   element={<CsContent />} />
      <Route path="doubly-linked-list"   element={<CsContent />} />
      <Route path="circular-linked-list" element={<CsContent />} />
    </Route>

    <Route path="/cs/ds/hash-table" element={<TopicLayout tabs={hashTable.tabs} />}>
      <Route index element={<CsOverview description={hashTable.description} />} />
      <Route path="hash-function"    element={<CsContent />} />
      <Route path="chaining"         element={<CsContent />} />
      <Route path="open-addressing"  element={<CsContent />} />
    </Route>

    <Route path="/cs/ds/stack-queue" element={<TopicLayout tabs={stackQueue.tabs} />}>
      <Route index element={<CsOverview description={stackQueue.description} />} />
      <Route path="stack"          element={<CsContent />} />
      <Route path="queue"          element={<CsContent />} />
      <Route path="circular-queue" element={<CsContent />} />
      <Route path="deque"          element={<CsContent />} />
    </Route>

    <Route path="/cs/ds/tree" element={<TopicLayout tabs={tree.tabs} />}>
      <Route index element={<CsOverview description={tree.description} />} />
      <Route path="binary-tree"    element={<CsContent />} />
      <Route path="bst"            element={<CsContent />} />
      <Route path="avl-tree"       element={<CsContent />} />
      <Route path="red-black-tree" element={<CsContent />} />
      <Route path="b-tree"         element={<CsContent />} />
    </Route>

    <Route path="/cs/ds/heap" element={<TopicLayout tabs={heap.tabs} />}>
      <Route index element={<CsOverview description={heap.description} />} />
      <Route path="max-heap"       element={<CsContent />} />
      <Route path="min-heap"       element={<CsContent />} />
      <Route path="binary-heap"    element={<CsContent />} />
      <Route path="priority-queue" element={<CsContent />} />
    </Route>

    <Route path="/cs/ds/graph" element={<TopicLayout tabs={graph.tabs} />}>
      <Route index element={<CsOverview description={graph.description} />} />
      <Route path="adjacency-matrix" element={<CsContent />} />
      <Route path="adjacency-list"   element={<CsContent />} />
      <Route path="graph-vs-tree"    element={<CsContent />} />
    </Route>

    <Route path="/cs/ds/trie" element={<TopicLayout tabs={trie.tabs} />}>
      <Route index element={<CsOverview description={trie.description} />} />
      <Route path="trie-structure"    element={<CsContent />} />
      <Route path="memory-efficiency" element={<CsContent />} />
    </Route>

    {/* 알고리즘 */}
    <Route path="/cs/algo/big-o" element={<TopicLayout tabs={bigO.tabs} />}>
      <Route index element={<CsOverview description={bigO.description} />} />
      <Route path="big-o-notation"   element={<CsContent />} />
      <Route path="time-complexity"  element={<CsContent />} />
      <Route path="space-complexity" element={<CsContent />} />
      <Route path="amortized"        element={<CsContent />} />
    </Route>

    <Route path="/cs/algo/sorting" element={<TopicLayout tabs={sorting.tabs} />}>
      <Route index element={<CsOverview description={sorting.description} />} />
      <Route path="bubble-sort"    element={<CsContent />} />
      <Route path="selection-sort" element={<CsContent />} />
      <Route path="insertion-sort" element={<CsContent />} />
      <Route path="merge-sort"     element={<CsContent />} />
      <Route path="quick-sort"     element={<CsContent />} />
      <Route path="heap-sort"      element={<CsContent />} />
      <Route path="radix-sort"     element={<CsContent />} />
    </Route>

    <Route path="/cs/algo/binary-search" element={<TopicLayout tabs={binarySearch.tabs} />}>
      <Route index element={<CsOverview description={binarySearch.description} />} />
      <Route path="binary-search"     element={<CsContent />} />
      <Route path="parametric-search" element={<CsContent />} />
    </Route>

    <Route path="/cs/algo/hash-search" element={<TopicLayout tabs={hashSearch.tabs} />}>
      <Route index element={<CsOverview description={hashSearch.description} />} />
      <Route path="hash-search" element={<CsContent />} />
    </Route>

    <Route path="/cs/algo/brute-force" element={<TopicLayout tabs={bruteForce.tabs} />}>
      <Route index element={<CsOverview description={bruteForce.description} />} />
      <Route path="brute-force"  element={<CsContent />} />
      <Route path="recursion"    element={<CsContent />} />
      <Route path="backtracking" element={<CsContent />} />
    </Route>

    <Route path="/cs/algo/dfs-bfs" element={<TopicLayout tabs={dfsBfs.tabs} />}>
      <Route index element={<CsOverview description={dfsBfs.description} />} />
      <Route path="dfs" element={<CsContent />} />
      <Route path="bfs" element={<CsContent />} />
    </Route>

    <Route path="/cs/algo/dp" element={<TopicLayout tabs={dp.tabs} />}>
      <Route index element={<CsOverview description={dp.description} />} />
      <Route path="memoization" element={<CsContent />} />
      <Route path="tabulation"  element={<CsContent />} />
      <Route path="knapsack"    element={<CsContent />} />
      <Route path="lcs"         element={<CsContent />} />
    </Route>

    <Route path="/cs/algo/greedy" element={<TopicLayout tabs={greedy.tabs} />}>
      <Route index element={<CsOverview description={greedy.description} />} />
      <Route path="optimal-substructure" element={<CsContent />} />
      <Route path="greedy-choice"        element={<CsContent />} />
      <Route path="huffman"              element={<CsContent />} />
    </Route>

    <Route path="/cs/algo/shortest-path" element={<TopicLayout tabs={shortestPath.tabs} />}>
      <Route index element={<CsOverview description={shortestPath.description} />} />
      <Route path="dijkstra"       element={<CsContent />} />
      <Route path="bellman-ford"   element={<CsContent />} />
      <Route path="floyd-warshall" element={<CsContent />} />
    </Route>

    {/* 네트워크 */}
    <Route path="/cs/network/osi" element={<TopicLayout tabs={osi.tabs} />}>
      <Route index element={<CsOverview description={osi.description} />} />
      <Route path="layers"       element={<CsContent />} />
      <Route path="encapsulation" element={<CsContent />} />
    </Route>

    <Route path="/cs/network/tcp-udp" element={<TopicLayout tabs={tcpUdp.tabs} />}>
      <Route index element={<CsOverview description={tcpUdp.description} />} />
      <Route path="connection"   element={<CsContent />} />
      <Route path="transmission" element={<CsContent />} />
    </Route>

    <Route path="/cs/network/handshake" element={<TopicLayout tabs={handshake.tabs} />}>
      <Route index element={<CsOverview description={handshake.description} />} />
      <Route path="three-way" element={<CsContent />} />
      <Route path="four-way"  element={<CsContent />} />
    </Route>

    <Route path="/cs/network/ip" element={<TopicLayout tabs={ip.tabs} />}>
      <Route index element={<CsOverview description={ip.description} />} />
      <Route path="ipv4-ipv6"      element={<CsContent />} />
      <Route path="subnet"         element={<CsContent />} />
      <Route path="public-private" element={<CsContent />} />
    </Route>

    <Route path="/cs/network/http" element={<TopicLayout tabs={http.tabs} />}>
      <Route index element={<CsOverview description={http.description} />} />
      <Route path="methods-status" element={<CsContent />} />
      <Route path="versions"       element={<CsContent />} />
      <Route path="encryption"     element={<CsContent />} />
      <Route path="ssl-tls"        element={<CsContent />} />
    </Route>

    <Route path="/cs/network/dns" element={<TopicLayout tabs={dns.tabs} />}>
      <Route index element={<CsOverview description={dns.description} />} />
      <Route path="dns-query" element={<CsContent />} />
      <Route path="l4-lb"     element={<CsContent />} />
      <Route path="l7-lb"     element={<CsContent />} />
    </Route>

    <Route path="/cs/network/auth" element={<TopicLayout tabs={auth.tabs} />}>
      <Route index element={<CsOverview description={auth.description} />} />
      <Route path="cookie"     element={<CsContent />} />
      <Route path="session"    element={<CsContent />} />
      <Route path="jwt"        element={<CsContent />} />
      <Route path="auth-authz" element={<CsContent />} />
    </Route>

    {/* 운영체제 */}
    <Route path="/cs/os/process-thread" element={<TopicLayout tabs={processThread.tabs} />}>
      <Route index element={<CsOverview description={processThread.description} />} />
      <Route path="process-thread"       element={<CsContent />} />
      <Route path="pcb-tcb"              element={<CsContent />} />
      <Route path="multi-process-thread" element={<CsContent />} />
    </Route>

    <Route path="/cs/os/cpu-scheduling" element={<TopicLayout tabs={cpuScheduling.tabs} />}>
      <Route index element={<CsOverview description={cpuScheduling.description} />} />
      <Route path="fcfs"                element={<CsContent />} />
      <Route path="sjf"                 element={<CsContent />} />
      <Route path="round-robin"         element={<CsContent />} />
      <Route path="priority-scheduling" element={<CsContent />} />
      <Route path="multilevel-queue"    element={<CsContent />} />
    </Route>

    <Route path="/cs/os/context-switching" element={<TopicLayout tabs={contextSwitching.tabs} />}>
      <Route index element={<CsOverview description={contextSwitching.description} />} />
      <Route path="condition" element={<CsContent />} />
      <Route path="overhead"  element={<CsContent />} />
    </Route>

    <Route path="/cs/os/synchronization" element={<TopicLayout tabs={synchronization.tabs} />}>
      <Route index element={<CsOverview description={synchronization.description} />} />
      <Route path="critical-section" element={<CsContent />} />
      <Route path="mutex"            element={<CsContent />} />
      <Route path="semaphore"        element={<CsContent />} />
      <Route path="monitor"          element={<CsContent />} />
    </Route>

    <Route path="/cs/os/deadlock" element={<TopicLayout tabs={deadlock.tabs} />}>
      <Route index element={<CsOverview description={deadlock.description} />} />
      <Route path="conditions"  element={<CsContent />} />
      <Route path="prevention"  element={<CsContent />} />
      <Route path="avoidance"   element={<CsContent />} />
      <Route path="detection"   element={<CsContent />} />
    </Route>

    <Route path="/cs/os/virtual-memory" element={<TopicLayout tabs={virtualMemory.tabs} />}>
      <Route index element={<CsOverview description={virtualMemory.description} />} />
      <Route path="paging"       element={<CsContent />} />
      <Route path="segmentation" element={<CsContent />} />
      <Route path="mmu"          element={<CsContent />} />
      <Route path="thrashing"    element={<CsContent />} />
    </Route>

    <Route path="/cs/os/page-replacement" element={<TopicLayout tabs={pageReplacement.tabs} />}>
      <Route index element={<CsOverview description={pageReplacement.description} />} />
      <Route path="fifo"              element={<CsContent />} />
      <Route path="lru"               element={<CsContent />} />
      <Route path="lfu"               element={<CsContent />} />
      <Route path="nur-second-chance" element={<CsContent />} />
    </Route>

    {/* 데이터베이스 */}
    <Route path="/cs/db/rdbms-nosql" element={<TopicLayout tabs={rdbmsNoSql.tabs} />}>
      <Route index element={<CsOverview description={rdbmsNoSql.description} />} />
      <Route path="rdbms"        element={<CsContent />} />
      <Route path="nosql"        element={<CsContent />} />
      <Route path="cap"          element={<CsContent />} />
      <Route path="sql-vs-nosql" element={<CsContent />} />
    </Route>

    <Route path="/cs/db/transaction" element={<TopicLayout tabs={transaction.tabs} />}>
      <Route index element={<CsOverview description={transaction.description} />} />
      <Route path="atomicity"   element={<CsContent />} />
      <Route path="consistency" element={<CsContent />} />
      <Route path="isolation"   element={<CsContent />} />
      <Route path="durability"  element={<CsContent />} />
    </Route>

    <Route path="/cs/db/isolation" element={<TopicLayout tabs={dbIsolation.tabs} />}>
      <Route index element={<CsOverview description={dbIsolation.description} />} />
      <Route path="read-uncommitted" element={<CsContent />} />
      <Route path="read-committed"   element={<CsContent />} />
      <Route path="repeatable-read"  element={<CsContent />} />
      <Route path="serializable"     element={<CsContent />} />
      <Route path="mvcc"             element={<CsContent />} />
    </Route>

    <Route path="/cs/db/index" element={<TopicLayout tabs={dbIndex.tabs} />}>
      <Route index element={<CsOverview description={dbIndex.description} />} />
      <Route path="b-tree"              element={<CsContent />} />
      <Route path="b-plus-tree"         element={<CsContent />} />
      <Route path="clustered-index"     element={<CsContent />} />
      <Route path="non-clustered-index" element={<CsContent />} />
    </Route>

    <Route path="/cs/db/normalization" element={<TopicLayout tabs={normalization.tabs} />}>
      <Route index element={<CsOverview description={normalization.description} />} />
      <Route path="1nf"             element={<CsContent />} />
      <Route path="2nf"             element={<CsContent />} />
      <Route path="3nf"             element={<CsContent />} />
      <Route path="bcnf"            element={<CsContent />} />
      <Route path="denormalization" element={<CsContent />} />
    </Route>

    <Route path="/cs/db/join" element={<TopicLayout tabs={join.tabs} />}>
      <Route index element={<CsOverview description={join.description} />} />
      <Route path="inner-join"       element={<CsContent />} />
      <Route path="outer-join"       element={<CsContent />} />
      <Route path="cross-self-join"  element={<CsContent />} />
      <Route path="nested-loop-join" element={<CsContent />} />
      <Route path="hash-join"        element={<CsContent />} />
    </Route>

    <Route path="/cs/db/anomaly" element={<TopicLayout tabs={anomaly.tabs} />}>
      <Route index element={<CsOverview description={anomaly.description} />} />
      <Route path="insertion-anomaly" element={<CsContent />} />
      <Route path="deletion-anomaly"  element={<CsContent />} />
      <Route path="update-anomaly"    element={<CsContent />} />
    </Route>

    {/* 디자인 패턴 */}
    <Route path="/cs/pattern/solid" element={<TopicLayout tabs={solid.tabs} />}>
      <Route index element={<CsOverview description={solid.description} />} />
      <Route path="srp" element={<CsContent />} />
      <Route path="ocp" element={<CsContent />} />
      <Route path="lsp" element={<CsContent />} />
      <Route path="isp" element={<CsContent />} />
      <Route path="dip" element={<CsContent />} />
    </Route>

    <Route path="/cs/pattern/creational" element={<TopicLayout tabs={creational.tabs} />}>
      <Route index element={<CsOverview description={creational.description} />} />
      <Route path="singleton"        element={<CsContent />} />
      <Route path="factory-method"   element={<CsContent />} />
      <Route path="abstract-factory" element={<CsContent />} />
      <Route path="builder"          element={<CsContent />} />
      <Route path="prototype"        element={<CsContent />} />
    </Route>

    <Route path="/cs/pattern/structural" element={<TopicLayout tabs={structural.tabs} />}>
      <Route index element={<CsOverview description={structural.description} />} />
      <Route path="adapter"   element={<CsContent />} />
      <Route path="bridge"    element={<CsContent />} />
      <Route path="composite" element={<CsContent />} />
      <Route path="decorator" element={<CsContent />} />
      <Route path="facade"    element={<CsContent />} />
      <Route path="flyweight" element={<CsContent />} />
      <Route path="proxy"     element={<CsContent />} />
    </Route>

    <Route path="/cs/pattern/behavioral" element={<TopicLayout tabs={behavioral.tabs} />}>
      <Route index element={<CsOverview description={behavioral.description} />} />
      <Route path="strategy"                element={<CsContent />} />
      <Route path="observer"                element={<CsContent />} />
      <Route path="state"                   element={<CsContent />} />
      <Route path="command"                 element={<CsContent />} />
      <Route path="template-method"         element={<CsContent />} />
      <Route path="iterator"                element={<CsContent />} />
      <Route path="visitor"                 element={<CsContent />} />
      <Route path="chain-of-responsibility" element={<CsContent />} />
      <Route path="mediator"                element={<CsContent />} />
      <Route path="memento"                 element={<CsContent />} />
      <Route path="interpreter"             element={<CsContent />} />
    </Route>

    <Route path="/cs/pattern/mvc-mvp-mvvm" element={<TopicLayout tabs={mvcMvpMvvm.tabs} />}>
      <Route index element={<CsOverview description={mvcMvpMvvm.description} />} />
      <Route path="mvc"  element={<CsContent />} />
      <Route path="mvp"  element={<CsContent />} />
      <Route path="mvvm" element={<CsContent />} />
    </Route>
  </>
);

export default csRoutes;
