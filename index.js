const SHA256 = require("crypto-js/sha256");
const chalk = require("chalk");

const DIFF = 4;

class Block {
  constructor(timestamp, txns, previousHash) {
    this.timestamp = timestamp;
    this.txns = txns;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }
  calculateHash() {
    return SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data) +
        this.nonce
    ).toString();
  }
  mineBlock(difficulty) {
    let count = 0;
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce += 1;
      count += 1;
      this.hash = this.calculateHash();
    }
    console.log(
      `Successfully hashed block with ` +
        chalk.dim(count) +
        ` NONCE. \nHASH: ` +
        chalk.green(this.hash)
    );
  }
}

class BlockChain {
  constructor() {
    this.chain = [];
    this.difficulty = DIFF;
    this.unminedTxns = [];
    this.miningReward = 10;
    this.registeredAddresses = [
      "wallet-James",
      "wallet-Nora",
      "wallet-George",
      "wallet-Peter",
      "wallet-Scarlet",
      "wallet-Kate",
      "wallet-Steve",
      "wallet-Miner69er",
    ];
    this.whoPay = {};
    this.createGenesisBlock();
    this.airdropCoins(10000);
  }
  airdropCoins(coins) {
    for (const address of this.registeredAddresses) {
      let txn = new Transaction(Date.now(), "mint", address, coins);
      this.unminedTxns.push(txn);
    }
    this.mineCurrentBlock("wallet-Miner69er");
  }
  createGenesisBlock() {
    let txn = new Transaction(Date.now(), "mint", "genesis", 0);
    let block = new Block(Date.now(), [txn], "0");
    this.chain.push(block);
  }
  getlatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  //   addBlock(newBlock) {
  //     newBlock.previousHash = this.getlatestBlock().hash;
  //     newBlock.mineBlock(this.difficulty);
  //     this.chain.push(newBlock);
  //   }
  mineCurrentBlock(minerAddress) {
    let validatedTxns = [];
    for (const txn of this.unminedTxns) {
      if (txn.payerAddress === "mint" || this.validateTransaction(txn)) {
        validatedTxns.push(txn);
      }
    }
    console.log("transaction validated: " + validatedTxns.length);
    let block = new Block(
      Date.now(),
      validatedTxns,
      this.getlatestBlock().hash
    );
    block.mineBlock(this.difficulty);

    console.log(chalk.yellow("Current Block successfully mined..."));
    this.chain.push(block);

    //Reset Unmined Transactions + reward the miner
    this.unminedTxns = [
      new Transaction(
        Date.now(),
        "mint",
        minerAddress,
        randomNum(1, this.miningReward)
      ),
    ];
  }

  validateTransaction(txn) {
    let payerAddress = txn.payerAddress;
    let balance = this.getAddressBalance(payerAddress);
    if (balance >= txn.amount) {
      return true;
    } else {
      return false;
    }
  }

  createTransaction(txn) {
    this.unminedTxns.push(txn);
  }
  getAddressBalance(address) {
    let balance = 0;
    for (const block of this.chain) {
      for (const txn of block.txns) {
        if (txn.payerAddress === address) {
          balance -= txn.amount;
        }
        if (txn.payeeAddress === address) {
          balance += txn.amount;
        }
      }
    }
    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Validate Data Intregity
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // Validate Hash Chain Link
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    // All is good
    return true;
  }

  randomPayment() {
    let payer = randomNum(0, this.registeredAddresses.length - 1);
    let payee = randomNum(0, this.registeredAddresses.length - 1);
    if (payee === payer) {
      while (payee === payer) {
        payee = randomNum(0, this.registeredAddresses.length - 1);
      }
    }
    this.whoPay.payer = this.registeredAddresses[payer];
    this.whoPay.payee = this.registeredAddresses[payee];
    // console.log(this.whoPay.payer);
    // console.log(this.whoPay.payee);
  }
  getPayer() {
    return this.whoPay.payer;
  }
  getPayee() {
    return this.whoPay.payee;
  }
}

class Transaction {
  constructor(timestamp, payerAddress, payeeAddress, amount) {
    this.timestamp = timestamp;
    this.payerAddress = payerAddress;
    this.payeeAddress = payeeAddress;
    this.amount = amount;
  }
}

function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function showStatements() {
  for (const wallet of jamesCoin.registeredAddresses) {
    console.log(
      chalk.blue(
        `\nBalance: ` +
          chalk.red.italic(wallet) +
          `: ` +
          chalk.green.bold(jamesCoin.getAddressBalance(wallet))
      ) + chalk.yellow(" JAMESCOIN💰")
    );
  }
  // console.log("\nBalance: James: " + jamesCoin.getAddressBalance("wallet-James"));
}

// function randomPayment(accounts) {
//   let payer = randomNum(0, accounts.length - 2);
//   let payee = randomNum(0, accounts.length - 2);
//   if (payer === payee) {
//     while (payer === payee) {
//       payer = randomNum(0, accounts.length - 2);
//     }
//   }

//   return { payer: accounts[payer], payee: accounts[payee] };
// }

let jamesCoin = new BlockChain();
// 1st Block
jamesCoin.createTransaction(
  new Transaction(Date.now(), "wallet-James", "wallet-Nora", 5000)
);
jamesCoin.createTransaction(
  new Transaction(Date.now(), "wallet-Nora", "wallet-James", 2500)
);
console.log("\nThe block is mining...");
jamesCoin.mineCurrentBlock("wallet-Miner69er");

console.log("\nBalance: James: " + jamesCoin.getAddressBalance("wallet-James"));
console.log("\nBalance: Nora: " + jamesCoin.getAddressBalance("wallet-Nora"));
console.log(
  "\nBalance: Miner69er: " + jamesCoin.getAddressBalance("wallet-Miner69er")
);
console.log(
  "Unmined Transactions: " +
    jamesCoin.unminedTxns[0].amount +
    " of " +
    jamesCoin.unminedTxns[0].payeeAddress
);
// 2nd Block
jamesCoin.createTransaction(
  new Transaction(Date.now(), "wallet-James", "wallet-Nora", 5000)
);
jamesCoin.createTransaction(
  new Transaction(Date.now(), "wallet-Nora", "wallet-James", 2500)
);
console.log("\nThe block is mining...");
jamesCoin.mineCurrentBlock("wallet-Miner70er");

console.log("\nBalance: James: " + jamesCoin.getAddressBalance("wallet-James"));
console.log("\nBalance: Nora: " + jamesCoin.getAddressBalance("wallet-Nora"));
console.log(
  "\nBalance: Miner69er: " + jamesCoin.getAddressBalance("wallet-Miner69er")
);
console.log(
  "Unmined Transactions: " +
    jamesCoin.unminedTxns[0].amount +
    " of " +
    jamesCoin.unminedTxns[0].payeeAddress
);

// 3rd try
console.log(chalk.blueBright("Timestamp : " + Date(Date.now()).toString()));
jamesCoin.randomPayment();
let tempAmount = randomNum(1, 100);
jamesCoin.createTransaction(
  new Transaction(
    Date.now(),
    jamesCoin.whoPay.payer,
    jamesCoin.whoPay.payee,
    tempAmount
  )
);
console.log(
  chalk.cyan(
    `${jamesCoin.getPayer()} paid for ${jamesCoin.getPayee()} amount: `
  ) +
    chalk.magenta(tempAmount) +
    chalk.yellow(' JAMESCOIN💰"')
);
console.log("\nThe block is mining...");
jamesCoin.mineCurrentBlock("wallet-Miner69er");

showStatements();

// console.log("\nBalance: James: " + jamesCoin.getAddressBalance("wallet-James"));
// console.log("\nBalance: Nora: " + jamesCoin.getAddressBalance("wallet-Nora"));
// console.log(
//   "\nBalance: Miner69er: " + jamesCoin.getAddressBalance("wallet-Miner69er")
// );
console.log(
  chalk.gray.dim("Unmined Transactions: " + jamesCoin.unminedTxns.length)
);

// Attemp Loops
for (let i = 0; i < 1000; i++) {
  console.log(chalk.blueBright("Timestamp : " + Date(Date.now()).toString()));
  jamesCoin.randomPayment();
  let tempAmount = randomNum(1, 100);
  jamesCoin.createTransaction(
    new Transaction(
      Date.now(),
      jamesCoin.whoPay.payer,
      jamesCoin.whoPay.payee,
      tempAmount
    )
  );
  console.log(
    chalk.cyan(
      `${jamesCoin.getPayer()} paid for ${jamesCoin.getPayee()} amount: `
    ) +
      chalk.magenta(tempAmount) +
      chalk.yellow(' JAMESCOIN💰"')
  );
  console.log("\nThe block is mining...");
  jamesCoin.mineCurrentBlock("wallet-Miner69er");

  showStatements();

  // console.log("\nBalance: James: " + jamesCoin.getAddressBalance("wallet-James"));
  // console.log("\nBalance: Nora: " + jamesCoin.getAddressBalance("wallet-Nora"));
  // console.log(
  //   "\nBalance: Miner69er: " + jamesCoin.getAddressBalance("wallet-Miner69er")
  // );
  console.log(
    chalk.gray.dim("Unmined Transactions: " + jamesCoin.unminedTxns.length)
  );
}
// let demoChain = new BlockChain();
// console.log("Starting to mine a new block...");
// demoChain.addBlock(
//   new Block(1, "26/11/22", {
//     amount: 10,
//   })
// );
// console.log("Starting to mine a new block...");
// demoChain.addBlock(
//   new Block(2, "27/11/22", {
//     amount: 20,
//   })
// );
// console.log(JSON.stringify(demoChain, null, 4));
// console.log("Is chain valid? " + demoChain.isChainValid());
