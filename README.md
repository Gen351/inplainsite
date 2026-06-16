# *Info-In-PlainSite*

# INITAL IDEA ---
### Password Hidden Messages
* Encrypt the data using:
  * **User/Cipher**
  * **Password/Key**
---
### *Features*
* Accross the web information sharing.
  * information are just UTF-8, can fit to int.
* Information is obfuscated to people who doesn't have the `Key&Cipher`.
* People can try different `Key&Cipher(s)` to decipher the the information.
---
---
## Implementation
### *Data Struct*
``` 
C++
  struct Info {
    // int because it fits UTF-8's size
    int name[]; // not unique
    int data[];
  };
```
### *App Flow*
1. Browse ***Info***
    1. When ***Info*** is chosen:
        1. Field: **Cipher**
        2. Field: **Key**
        3. Decipher using **Cipher** and **Key**.
2. Search ***Info***
    * Enter: 
      * Display ***Info*** that name is close to/ the same as the search.
      * **GOTO** 1.1.
3. Add ***Info***
    * Field: **Cipher**
    * Field: **Key**
    * Field: ***Info***.name
    * Field: ***Info***.data
    * Encrypt using **Cipher** and **Key**.
    * Append to ***[DATABASE](#infodb)***.

# InfoDB
Sheets style database
|  | A | B |
| --- | --- | --- |
| 1 | ***Info***.name | ***Info***.data |
| 2 | ***Info***.name | ***Info***.data |
| 3 | ***Info***.name | ***Info***.data |
| 4 | ***Info***.name | ***Info***.data |
# --- INITIAL IDEA
