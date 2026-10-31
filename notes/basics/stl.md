---
title: STL
tags: [stl]
difficulty: 1
---

## 簡介
**STL** (Standard Template Library) 是 C++ 的標準模板庫，有許多很常會用到的容器、演算法等，一定會用到，一定要全會

## vector

陣列，由一連串的同種元素形成

宣告一個陣列
```cpp=
vector<int> array(n, 0); // 由 n 個為 0 的整數組成
vector<bool> found; // 建立一個空陣列，元素資料型態為 bool
```

給予陣列長度與值

```cpp=
vector<int> a;
vector<int> b;

a.resize(n); // a 變為長度 n 的陣列
b.assign(m, 1); // b 變為長度 m ，每個元素為 1
```

陣列內元素賦值/取值

```cpp=
vector<int> a={0, 1, 2, 3, 4};

a[1]=4; // 將編號 1 的值設為 4

cout<<a[0]; // 輸出編號 0 的值 (0)
cout<<a[1]; // 輸出編號 1 的值 (4)
```

刪除元素

## set

### multiset

### unordered_set

## map

### multimap

### unordered_map

## stack

## queue

## deque

## priority_queue
