# Script Readme

## Fetch all ERC721

```sh
node script/index.js erc721
```

# API

| API                      | Method | Example                                      | Explain                                  |
| ------------------------ | ------ | -------------------------------------------- | ---------------------------------------- |
| /user/:address/:erc      | Get    | /user/0x69...F529/erc721?skip=0&limit=5      | Get all erc721 of user                   |
| /user/:address/:erc      | Get    | /user/0x69...F529/erc1155?skip=0&limit=5     | Get all erc1155 of user                  |
| /user/:address/:erc      | Get    | /user/0x69...F529/all?skip=0&limit=5         | Get all erc721 and erc1155 of user       |
| /user/:address/:erc      | Get    | /user/0x69...F529/formatByNft?skip=0&limit=5 | Get all erc721 and erc1155 format by nft |
| /nft/:address/           | Get    | /nft/0x69...F529?skip=0&limit=5              | Get all nft with address                 |
| /nft/:address/:tokenId   | Get    | /nft/0x69...F529/5                           | Get detail nft with address and tokenId  |
| /sellOrder/:filter       | Get    | /sellOrder/all?skip=0&limit=5                | Get all sellOrder list                   |
| /sellOrder/:filter       | Get    | /sellOrder/formatByNft?skip=0&limit=5        | Get sellOrder list format by nft         |
| /sellOrder/:filter       | Get    | /sellOrder/sortByPrice?skip=0&limit=5        | Get sellOrder list sort by price         |
| /sellOrder/user/:address | Get    | /sellOrder/user/0x69...F529?skip=0&limit=5   | Get sellOrder list of user               |
