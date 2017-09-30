var utils = require("./utils.js");

var genesisCoinbaseTransactionTxid = "d1d71d8ec5323a2fe6e5201879a354f93127687274cdcc129fe45a19d2042df5";
var genesisCoinbaseTransaction = {
	"hex": "01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff3504ffff001d01042d696e2073746174752071756f20726573206572616e7420616e74652062656c6c756d2032392f30392f32303137ffffffff0100f2052a010000004341041691c1f3712ce186e6bc5463d59238d9c03c0cefbd796b02c9f578d77bec665de31889347dac3ced71b1334d03f625a02dabe63f2971af2fc5bb79b69f0b8ba3ac00000000",
	"txid": "d1d71d8ec5323a2fe6e5201879a354f93127687274cdcc129fe45a19d2042df5",
	"hash": "d1d71d8ec5323a2fe6e5201879a354f93127687274cdcc129fe45a19d2042df5",
	"size": 180,
	"vsize": 180,
	"version": 1,
	"confirmations": 475000,
	"vin": [
		{
			"coinbase": "04ffff001d01042d696e2073746174752071756f20726573206572616e7420616e74652062656c6c756d2032392f30392f32303137",
			"sequence": 4294967295
		}
	],
	"vout": [
		{
			"value": 50,
			"n": 0,
			"scriptPubKey": {
				"asm": "041691c1f3712ce186e6bc5463d59238d9c03c0cefbd796b02c9f578d77bec665de31889347dac3ced71b1334d03f625a02dabe63f2971af2fc5bb79b69f0b8ba3 OP_CHECKSIG",
				"hex": "41041691c1f3712ce186e6bc5463d59238d9c03c0cefbd796b02c9f578d77bec665de31889347dac3ced71b1334d03f625a02dabe63f2971af2fc5bb79b69f0b8ba3ac",
				"reqSigs": 1,
				"type": "pubkey",
				"addresses": [
					"17jbFdpjudouJeSATzrJSvr8maou3L14EZ"
				]
			}
		}
	],
	"blockhash": "00000325c2a5561a9b22ae38f9bdee5711e736ad7f46e24b4688a5f53bbd50d3",
	"time": 1506743937,
	"blocktime": 1506743937
};

function getInfo() {
	return new Promise(function(resolve, reject) {
		client.cmd('getinfo', function(err, result, resHeaders) {
			if (err) {
				return console.log("Error 3207fh0f: " + err);
			}

			resolve(result);
		});
	});
}

function getMempoolInfo() {
	return new Promise(function(resolve, reject) {
		client.cmd('getmempoolinfo', function(err, result, resHeaders) {
			if (err) {
				return console.log("Error 23407rhwe07fg: " + err);
			}

			resolve(result);
		});
	});
}

function getBlockByHeight(blockHeight) {
	console.log("getBlockByHeight: " + blockHeight);

	return new Promise(function(resolve, reject) {
		var client = global.client;

		client.cmd('getblockhash', blockHeight, function(err, result, resHeaders) {
			if (err) {
				return console.log("Error 0928317yr3w: " + err);
			}

			client.cmd('getblock', result, function(err2, result2, resHeaders2) {
				if (err2) {
					return console.log("Error 320fh7e0hg: " + err2);
				}

				resolve({ success:true, getblockhash:result, getblock:result2 });
			});
		});
	});
}

function getBlocksByHeight(blockHeights) {
	console.log("getBlocksByHeight: " + blockHeights);

	return new Promise(function(resolve, reject) {
		var batch = [];
		for (var i = 0; i < blockHeights.length; i++) {
			batch.push({
				method: 'getblockhash',
				params: [ blockHeights[i] ]
			});
		}

		var blockHashes = [];
		client.cmd(batch, function(err, result, resHeaders) {
			blockHashes.push(result);

			if (blockHashes.length == batch.length) {
				var batch2 = [];
				for (var i = 0; i < blockHashes.length; i++) {
					batch2.push({
						method: 'getblock',
						params: [ blockHashes[i] ]
					});
				}

				var blocks = [];
				client.cmd(batch2, function(err2, result2, resHeaders2) {
					if (err2) {
						console.log("Error 138ryweufdf: " + err2);
					}

					blocks.push(result2);
					if (blocks.length == batch2.length) {
						resolve(blocks);
					}
				});
			}
		});
	});
}

function getBlockByHash(blockHash) {
	console.log("getBlockByHash: " + blockHash);

	return new Promise(function(resolve, reject) {
		var client = global.client;

		client.cmd('getblock', blockHash, function(err, result, resHeaders) {
			if (err) {
				console.log("Error 0u2fgewue: " + err);
			}

			resolve(result);
		});
	});
}

function getTransactionInputs(rpcClient, transaction, inputLimit=0) {
	console.log("getTransactionInputs: " + transaction.txid);

	return new Promise(function(resolve, reject) {
		var txids = [];
		for (var i = 0; i < transaction.vin.length; i++) {
			if (i < inputLimit || inputLimit == 0) {
			txids.push(transaction.vin[i].txid);
		}
		}

		getRawTransactions(txids).then(function(inputTransactions) {
			resolve({ txid:transaction.txid, inputTransactions:inputTransactions });
		});
	});
}

function getRawTransaction(txid) {
	return new Promise(function(resolve, reject) {
		if (txid == genesisCoinbaseTransactionTxid) {
			getBlockByHeight(0).then(function(blockZeroResult) {
				var result = genesisCoinbaseTransaction;
				result.confirmations = blockZeroResult.getblock.confirmations;
				resolve(result);
			});

			return;
		}

		client.cmd('getrawtransaction', txid, 1, function(err, result, resHeaders) {
			if (err) {
				console.log("Error 329813yre823: " + err);
			}
			resolve(result);
		});
	});
}

function getRawTransactions(txids) {
	console.log("getRawTransactions: " + txids);

	return new Promise(function(resolve, reject) {
		if (!txids || txids.length == 0) {
			resolve([]);

			return;
		}

		if (txids.length == 1 && txids[0] == "d1d71d8ec5323a2fe6e5201879a354f93127687274cdcc129fe45a19d2042df5") {
			// copy the "confirmations" field from genesis block to the genesis-coinbase tx
			getBlockByHeight(0).then(function(blockZeroResult) {
				var result = genesisCoinbaseTransaction;
				result.confirmations = blockZeroResult.getblock.confirmations;

				resolve([result]);
			});

			return;
		}

		var requests = [];
		for (var i = 0; i < txids.length; i++) {
			var txid = txids[i];

			if (txid) {
				requests.push({
					method: 'getrawtransaction',
					params: [ txid, 1 ]
				});
			}
		}

		var requestBatches = utils.splitArrayIntoChunks(requests, 20);

		executeBatchesSequentially(requestBatches, function(results) {
			resolve(results);
		});
	});
}

function executeBatchesSequentially(batches, resultFunc) {
	var batchId = utils.getRandomString(20, 'aA#');

	console.log("Starting " + batches.length + "-item batch " + batchId + "...");

	executeBatchesSequentiallyInternal(batchId, batches, 0, [], resultFunc);
}

function executeBatchesSequentiallyInternal(batchId, batches, currentIndex, accumulatedResults, resultFunc) {
	if (currentIndex == batches.length) {
		console.log("Finishing batch " + batchId + "...");

		resultFunc(accumulatedResults);

			return;
		}

	console.log("Executing item #" + (currentIndex + 1) + " (of " + batches.length + ") for batch " + batchId);

	var count = batches[currentIndex].length;

	client.cmd(batches[currentIndex], function(err, result, resHeaders) {
			if (err) {
			console.log("Error f83024hf4: " + err);
			}

		accumulatedResults.push(result);

			count--;

			if (count == 0) {
			executeBatchesSequentiallyInternal(batchId, batches, currentIndex + 1, accumulatedResults, resultFunc);
			}
		});
}

function getBlockData(rpcClient, blockHash, txLimit, txOffset) {
	console.log("getBlockData: " + blockHash);

	return new Promise(function(resolve, reject) {
		client.cmd('getblock', blockHash, function(err2, result2, resHeaders2) {
			if (err2) {
				console.log("Error 3017hfwe0f: " + err2);

				reject(err2);

				return;
			}

			var txids = [];
			for (var i = txOffset; i < Math.min(txOffset + txLimit, result2.tx.length); i++) {
				txids.push(result2.tx[i]);
			}

			getRawTransactions(txids).then(function(transactions) {
				var txInputsByTransaction = {};

				var promises = [];
				for (var i = 0; i < transactions.length; i++) {
					var transaction = transactions[i];

					if (transaction) {
						promises.push(getTransactionInputs(client, transaction, 10));
					}
				}

				Promise.all(promises).then(function() {
					var results = arguments[0];

					for (var i = 0; i < results.length; i++) {
						var resultX = results[i];

						txInputsByTransaction[resultX.txid] = resultX.inputTransactions;
					}

					resolve({ getblock:result2, transactions:transactions, txInputsByTransaction:txInputsByTransaction });
				});
			});
		});
	});
}

module.exports = {
	getInfo: getInfo,
	getMempoolInfo: getMempoolInfo,
	getBlockByHeight: getBlockByHeight,
	getBlocksByHeight: getBlocksByHeight,
	getBlockByHash: getBlockByHash,
	getTransactionInputs: getTransactionInputs,
	getBlockData: getBlockData,
	getRawTransaction: getRawTransaction,
	getRawTransactions: getRawTransactions
};
