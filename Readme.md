# Script Readme

| script                                                | Explain                                          |
| ----------------------------------------------------- | ------------------------------------------------ |
| node script/index.js erc721                           | Fetch all ERC721                                 |
| node script/index.js erc1155 0xc33d69a3...3987bde9    | Fetch ERC1155 by address                         |
| node script/index.js nftAddress 0xc33d69a3...3987bde9 | Fetch all ERC721 by address                      |
| node script/index.js imgDown                          | Down quality of all image                        |
| node script/index.js imgDown 0xc33d69a3...3987bde9    | Down quality of image by nft address             |
| node script/index.js imgDown 0xc33d69a3...3987bde9 10 | Down quality of image by nft address adn tokenID |
| node script/index.js sellOrder                        | Fetch all sell Order                             |

# API

| API                      | Method | Example                                      | Explain                                                      |
| ------------------------ | ------ | -------------------------------------------- | ------------------------------------------------------------ |
| /user/:address/:erc      | Get    | /user/0x69...F529/erc721?skip=0&limit=5      | Get all erc721 of user                                       |
| /user/:address/:erc      | Get    | /user/0x69...F529/erc1155?skip=0&limit=5     | Get all erc1155 of user                                      |
| /user/:address/:erc      | Get    | /user/0x69...F529/all?skip=0&limit=5         | Get all erc721 and erc1155 of user                           |
| /user/:address/:erc      | Get    | /user/0x69...F529/formatByNft?skip=0&limit=5 | Get all erc721 and erc1155 format by nft                     |
| /nft/:address/           | Get    | /nft/0x69...F529?skip=0&limit=5              | Get all nft with address                                     |
| /nft/:address/:tokenId   | Get    | /nft/0x69...F529/5                           | Get detail nft with address and tokenId                      |
| /sellOrder/:filter       | Get    | /sellOrder/all?skip=0&limit=5                | Get all sellOrder list                                       |
| /sellOrder/:filter       | Get    | /sellOrder/formatByNft?skip=0&limit=5        | Get sellOrder list format by nft                             |
| /sellOrder/:filter       | Get    | /sellOrder/sortByPrice?skip=0&limit=5        | Get sellOrder list sort by price                             |
| /sellOrder/user/:address | Get    | /sellOrder/user/0x69...F529?skip=0&limit=5   | Get sellOrder list of user                                   |
| /verify/user/:address    | Get    | /verify/user/0x69...F529                     | return `{ "isVerify": true }` if user verified               |
| /verify/nft/:address     | Get    | /verify/nft/0x69...F529                      | return `{ "isVerify": true }` if nft verified                |
| /verify/user             | Post   | /verify/user                                 | request body `{ "address": "0x69...F529","isVerify": true }` |
| /verify/nft              | Post   | /verify/nft                                  | request body `{ "address": "0x69...F529","isVerify": true }` |
| /verify/nft              | Get    | /verify/nft                                  | return all nft address verified                              |
| /verify/user             | Get    | /verify/user                                 | return all user address verified                             |

verify address all network
| API | Method | Example | Explain |
| ------------------------ | ------ | -------------------------------------------- | ------------------------------------------------------------ |
| /verifyAllNetwork | Post | /verifyAllNetwork | request body `{ "address": "0x69...F529","network": 97 }` |
| /verifyAllNetwork?network= | Get | /verifyAllNetwork?network=97 | return all verified address of network |
| /verifyAllNetwork/:address | Delete | /verifyAllNetwork/0x69...F529 | delete verified address |
