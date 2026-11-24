---
title: Vector 
description: 陣列寫法及常見運用
date: 2026-11-24
tags: stl
difficulty: 1
---

在寫程式的過程中，如果想要記錄很多個相同類型的資料，並將值存在一個位置，通常會使用 `vector`

`vector` 是 `0-indexed` 也就是說以第 $0$ 項開頭，本文全部都是 `0-indexed`

## 宣告
 
宣告一個新的正整數陣列

```cpp
vector<int> a={1, 2, 4}; 
```

宣告長度為 $N$ 且每一個值都為 $x$ 的正整數陣列 (如果沒有給 $x$ 預設為 $0$ )

```cpp
vector<int> a(N, x); 
```

宣告其他類型的，for ex. `double`

```cpp
vector<double> a; 
```

## 輸入

輸入 $N$ 及一個長度為 $N$ 的正整數陣列

```cpp
int N; cin>>N; 
vector<int> a(N); 
for (auto &x : a) cin>>x; 
```

## 基礎運算

$a$ 的長度
```cpp
int x=(int)a.size(); 
```

$a$ 是否為空
```cpp
bool x=a.empty(); 
```

陣列 $a$ 的第 $i$ 項
```cpp
int x=a[i]; 
```

在 $a$ 的最後添加一個新的數 $x$，時間 $O(1)$
```cpp
a.push_back(x); 
```

把 $a$ 的最後一項移除，時間 $O(1)$
```cpp
a.pop_back(); 
```

把 $a$ 清空，時間 $O(N)$
```cpp
a.clear(); 
```

在 $a$ 的第 $i$ 項前面加入一個元素 $x$ ，時間 $O(N)$
```cpp
a.insert(a.begin()+i, x); 
```

把 $a$ 的第 $i$ 項移除，時間 $O(N)$
```cpp
a.erase(a.begin()+i); 
```

把 $a$ 變為長度 $M$ 的陣列，時間 $O(M)$
```cpp
a.resize(M); 
```

把 $a$ 變為長度 $M$ 及每一項為 $x$ 的陣列，時間 $O(M)$
```cpp
a.assign(M, x); 
```

## 迴圈

重複 $a$ 的每一項，當你需要知道位置時
```cpp
for (int i=0; i<(int)a.size(); i++) {
    // ...
}
```

重複 $a$ 的每一項，如果不用更改數值
```cpp
for (int x : a) {
    // ... 
}
```

重複 $a$ 的每一項，會更改數值 
```cpp
for (int &x : a) {
    // ...
}
```

## 演算法

排序 $a$，由小到大，時間 $O(N \log N)$
```cpp
sort(a.begin(), a.end()); 
```

排序 $a$，由大到小， `int` 要用陣列的內容類型，時間 $O(N \log N)$
```cpp
sort(a.begin(), a.end(), greater<int>()); 
```

自定義排序，時間 $O(N \log N)$
```cpp
sort(a.begin(), a.end(), comp);

// 宣告 (main 之外)
bool comp(int a, int b) { // 回傳 true 代表 a 要排在 b 前面
    return a>b;
}
```

反轉陣列，時間 $O(N)$
```cpp
reverse(a.begin(), a.end()); 
```

最大值，時間 $O(N)$

最小值用法一樣，是 `min_element`
```cpp
int i=max_element(a.begin(), a.end())-a.begin(); // 位置
int x=*max_element(a.begin(), a.end()); // 最大值
```

總和，時間 $O(N)$，要記得用 `0LL` 不然會 `overflow`
```cpp
long long sum=accumulate(a.begin(), a.end(), 0LL); 
```

去除重複的元素，時間 $O(N \log N)$
```cpp
sort(a.begin(), a.end()); 
a.erase(unique(a.begin(), a.end()), a.end()); 
```

找 $x$ 出現第一次的位置，時間 $O(N)$，找不到會回傳 `a.size()`
```cpp
int i=find(a.begin(), a.end(), x)-a.begin(); 
```

$x$ 在 $a$ 中出現的次數，時間 $O(N)$
```cpp
int c=count(a.begin(), a.end(), x); 
```