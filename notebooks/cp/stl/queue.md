---
title: Queue
description: Queue 寫法
date: 2026-11-27
tags: stl
difficulty: 1
---

`queue` 是 FIFO (first in first out) 的資料結構，也就是第一個存的資料第一個出來，就像是商店的隊伍一樣，先排隊的人先結帳。

## 宣告

```cpp
queue<int> q; 
```

## 基礎運算

皆為時間 $O(1)$ 

增加一個值在最後
```cpp
q.push(x); 
```

取得最前面的值
```cpp
int x=q.front(); 
```

移除最前面的值
```cpp
q.pop(); 
```

取得長度
```cpp
int s=q.size(); 
```

是否為空？
```cpp
bool e=q.empty(); 
```

## 注意

- `pop()` 及 `front()` 在 `!q.empty()` 才能使用，要先判斷
- 沒有辦法用迴圈走過其中的每一個值，如果要的話用 `vector`

> 如果要兩端都可以增加值/取值，要用 `deque` (double-ended queue)