# 1. Start mongodb

```bash
sudo systemctl start mongod
```

# 2. Init collections

## BSC Mainnet

```bash
node scripts/scripts.js initCollectionsInfo 56
```

## BSC Testnet

```bash
node scripts/scripts.js initCollectionsInfo 97
```

## Polygon

```bash
node scripts/scripts.js initCollectionsInfo 137
```

# 3. Listen event

```bash
node helpers/listenEvent.js
```

# 4. Fetch all active sellOrder

### BSC Mainnet

```bash
node scripts/scripts.js activeSellOrder 56
```

### BSC Testnet

```bash
node scripts/scripts.js activeSellOrder 97
```

### Polygon

```bash
node scripts/scripts.js activeSellOrder 137
```
