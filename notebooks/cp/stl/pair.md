---
title: Pair
description: Pair 寫法及常見運用
date: 2026-11-25
tags: stl
difficulty: 1
---

`pair` 可以將兩個值綁在一起，兩個值不一定要是同一個類型

## 宣告

宣告
```cpp
pair<int, int> p={1, 2}; 
pair<string, double> q={"jimmy", 654.321}; 
```

如果會用到很多次，我們會在 `main()` 前宣告縮寫
```cpp
using pii=pair<int, int>; 
using pll=pair<long long, long long>; 
```

## 取值

取值
```cpp
int x=p.first; // 第一個值
int y=p.second; // 第二個值
```

更改
```cpp
p.first=1; 
```

進階
```cpp
auto [a, b]=p; 
auto &[c, d]=q; 
```

`a`, `b` 是 `p` 的複製，改 `a`, `b` 不會改到 `p`

加上 `&` 所以改 `c`, `d` 會改 `q`

## 迴圈

`auto &[a, b]` 可以用在迴圈，把多個 `pair` 存入 `vector`，要加 `&` 才有辦法存入
```cpp
int N; cin>>N; 
vector<pair<int, int>> a(N); 
for (auto &[x, y] : a) cin>>x>>y; 
```

## 排序

比較的時候，先比 `first` 再比 `second`

for ex. `{2, 2} > {2, 1} > {1, 2}`

`sort` 即是這樣排序，下面的就是先看 `first`， `first` 一樣才比 `second`
```cpp
vector<pair<int, int>> a={...}; 
sort(a.begin(), a.end()); 
```

如果要用 `second` 先排，則這樣寫
```cpp
bool comp(pii a, pii b) {
    return a.second<b.second; 
} 

// ...

sort(a.begin(), a.end(), comp); 
```