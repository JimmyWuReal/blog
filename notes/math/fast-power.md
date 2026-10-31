---
title: 快速冪
tags: [math, divide-and-conquer]
---

常見的快速冪主要是用來高效率算出一個東西的 $N$ 次方，但快速冪不只這樣，只要是有結合律的東西其實都有機會用到

有些題目可能會用到矩陣的次方，我寫在 [矩陣快速冪](matrix-fast-power.md)

## 算 X 的 N 次方

### 題目

輸入兩個整數 $x$ 和 $n$ $(x<10^4, n<10^{18})$

請輸出 $x^n$

因為輸出很大，將結果對 $10^9+7$ 取餘數

### 思路

一般人可能會想要直接一個一個算，從 $x^1, x^2, x^3$ 一路算到 $x^n$

但題目給的條件 $n<10^{18}$ ，用 $O(n)$ 的方法很明顯的不可行

所以我們可以用十分簡單的數學來拆解這個問題

因為 $x^{2n}=(x^n)^2$

所以要求 $x^{2n}$ 時，可以先求出 $x^n$ 再將那個數平方

所以像是 $x^{9}$ 可以視為 $((x^{2})^2)^2*x$，原本一個一個乘需要8次運算，就被簡化為了4次

此時複雜度為 $O(log\ n)$ 便可以通過

結論：

- 如果 $x^{2n}$ 先算 $x^n$ 再平方
- 如果不是偶數次方，$x^n$ 就用 $x^{n-1}*x$

### 程式

用遞迴來解決，建立一個函式 $f(x, n)$，求 $x^n$

如果 $n=0$ 回傳 $1$
如果 $n$ 為偶數回傳 $f(x, n/2)^2$
如果 $n$ 為奇數回傳 $f(x, n-1)*x$

```cpp=
#include <bits/stdc++.h>
using namespace std;

using ll=long long;

const ll MOD=1e9+7; // MOD

ll p(ll x, ll n) {
    if (n==0) { // 0 次方
        return 1;
    } else if (n%2==0) { // 偶數次方
        ll temp=p(x, n/2)%MOD;
        return temp*temp%MOD;
    } else { // 奇數次方
        return p(x, n-1)*x%MOD;
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);

    ll x, n; cin>>x>>n;

    cout<<p(x, n)<<'\n';
}
```

### 注意事項

偶數次方要先將 $x^{\frac{n}{2}}$ 設為一個變數 `temp`
```cpp=
ll temp=p(x, n/2)%MOD;
return temp*temp%MOD;
```
如果直接用兩次 `p(x, n/2)` 的話運算會是兩倍，這樣等於沒有省

然後很容易不小心溢位，要記得用 `%MOD` 然後可以就用 `long long` 比較安全
