---
title: 初始程式
---

這是你會在一開始先打的東西，每一題都是用這個


```cpp=
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0); // or cin.tie(nullptr);

    // your code here

    return 0;
}
```

## 拆解

首先引入標準函式庫
```cpp
#include <bits/stdc++.h>
```

讓你不用每個東西前面打 `std::`
```cpp
using namespace std;
```

主函式
```cpp
int main() {
    // ...

    return 0;
}
```

優化 I/O ，有些題目會有差別
```cpp
ios::sync_with_stdio(false);
cin.tie(0);
```

## 優化 I/O 詳解

在一般的程式中

`cin`, `cout` 會和 `scanf`, `printf` 同步，會增加額外的效能成本，所以要加：

```cpp
ios::sync_with_stdio(false);
```

> 注意：因為現在不同步了，不要把 `cin` `cout` 跟 `scanf` `printf` 混合使用，避免有問題

---

然後，一般的程式，在要輸入的時候，會先把之前的輸出顯示出來，稱為 `flush`

所以你打：


```cpp
cout<<"Enter Your Name: ";
cin>>name;
```

會先輸出 `Enter Your Name: ` 再準備讀取你的輸入

這個在輸出輸入很多時也會造成不必要的額外時間

所以使用這個來避免：

```cpp
cin.tie(0);
// or
cin.tie(nullptr);
```

> 注意：有一些互動的題目不能這樣用

## 多測資

如果有 $T$ 個測資，通常先輸入 $T$ 然後運行主程式 $T$ 次

常見有兩種寫法:

```cpp=
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);

    int T; cin>>T;

    while (T--) {
        // Main code
    }

    return 0;
}
```

```cpp=
#include <bits/stdc++.h>
using namespace std;

void solve() {
    // Main code
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);

    int T; cin>>T;

    while (T--) {
        solve();
    }

    return 0;
}
```
