---
title: 輸入
---

## 優化輸入

```cpp=
ios::sync_with_stdio(false);
cin.tie(0);
```

解釋在 [初始程式](starting-template.md)

## cin

最常用的輸入法，輸入到空白或換行

輸入數字
```cpp=
int x;
cin>>x; // ex. 100
```

輸入字串
```cpp=
string s;
cin>>s; // ex. "hello_world_123"
```

## getline

讀取一整行，實際用法如下

```cpp=
string s;
getline(cin, s);
```

一直讀取直到 `EOF`

> 這個不一定要用 getline 如果一行一個東西可以用 cin 就好

```cpp=
string s;

while (getline(cin, s)) {
    // ...
}
```

讀取每一行並存為 `vector<string>`

```cpp=
string s;
vector<string> a;

while (getline(cin, s)) a.push_back(s);
```

`getline` 可以自訂結束的符號，不一定要是換行

ex. 用 `,` 分段存進 `vector<string>`

```cpp=
string s;
vector<string> a;

while (getline(cin, s, ',')) a.push_back(s);
```

這邊如果 `s` 超過一行會取到 `\n` ，所以可以先用 `getline`

注意: `cin` 和 `getline` 混用，要小心 `getline` 可能會為空

如下，這樣因為 `cin` 之後只剩下換行 `s` 不會取得任何東西就遇到換行

```cpp=
int n;
string s;

cin>>n;
getline(cin, s);
```

解法: `cin.ignore()`

```cpp=
int n;
string s;

cin>>n;
cin.ignore();
getline(cin, s);
```

如果可能會有不只一個換行，要用

```cpp
cin.ignore(numeric_limits<streamsize>::max(), '\n');
```

## stringstream

把一個字串分段，預設用空白分

把一個字串的數字輸入到 `vector`
```cpp=
string s="100 1 2 3";
stringstream ss(s);

vector<int> a;

int x;
while (ss>>x) a.push_back(x);

for (int x : a) cout<<x<<'.';  // 100.1.2.3.
```

自定義分段符號，用 `getline`

ex. 用 `,` 分段

```cpp=
string s="123,hello,world!";

stringstream ss(s);

vector<string> a;

string x;
while (getline(ss, x, ',')) a.push_back(x);
```
