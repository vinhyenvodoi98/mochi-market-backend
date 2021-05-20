# Script Readme

## Fetch all ERC721

```sh
node script/index.js erc721
```

# API

| API                 | Method | Example                                 | Explain                           |
| ------------------- | ------ | --------------------------------------- | --------------------------------- |
| /user/:address/:erc | Get    | /user/0x69...F529/erc721?skip=0&limit=5 | Get all erc721 or erc1155 of user |
| /nft/:address/      | Get    | /user/0x69...F529?skip=0&limit=5        | Get all nft with address          |
