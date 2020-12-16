const { parseJson, toJson, getClients, setClients, deleteClients, originIsAllowed } = require('./helperFuncs');

/**
 *
 * @param {object} messageObject
 * @description determines what type of encoding is used to communicate
 * with client socket, server socket only supports UTF8 and binary.
 * @return {object} with determind encoding and message object received
 *  from client communication.
 */
function determineType(messageObject) {
	let acc = {};
	switch (messageObject.type) {
		case 'utf8':
			acc.key = 'sendUTF';
			acc.message = parseJson(messageObject[`${messageObject.type}Data`]);
			break;
		case 'binary':
			acc.key = 'sendBytes';
			acc.message = parseJson(messageObject[`${messageObject.type}Data`]);
			break;
		default:
			break;
	}

	return acc;
}

/**
 * @param {object} conn is the client websocket
 * @param {string} key is the encoding type to use when sending message to client(s) websocket
 * @param {object} message is the message object sent by client
 * @description determins what type of message client is trying to
 * send to clients peers in same room and sends such message.
 * @returns {undefined} undefined
 */
function messageType(conn, key, message) {
	const ary = getClients(message.roomName);
	switch (message.type) {
		case 'EnterRoom':
			if (ary.length > 0 && ary.length < 2) {
				setClients(message.roomName, conn);
			} else if (ary.length === 0) {
				setClients(message.roomName, conn);
			} else {
				conn[key](
					toJson({
						text: `room ${message.roomName} is at capacity generate new room ID or try again later.`,
						type: 'roomIsFull',
					})
				);
				return;
			}

			conn[key](
				toJson({
					text: `You are waiting in room:: ${message.roomName}, share key with friend.`,
					key: message.roomName,
					type: 'roomEntered',
					nOfPeopleInRoom: getClients(message.roomName).length,
				})
			);

			break;
		case 'wrtcSdpExchange':
			if (ary.length) {
				ary.forEach((registerdConn) => {
					if (registerdConn !== conn) {
						message.type = 'sdpData';
						registerdConn[key](toJson(message));
					}
				});
			}
			break;
		case 'initCall':
			ary.forEach((registerdConn) => {
				if (registerdConn !== conn) {
					registerdConn[key](toJson(message));
				}
			});
			break;

		default:
			break;
	}
}
/**
 *
 * @param {object} conn is the client websocket
 * @description all client(s) connection events are dealt with in this function.
 * @returns {undefined} undefined
 */
function wsConn(conn) {
	conn.on('message', (clientMsg) => {
		const { message, key } = determineType(clientMsg);
		messageType(conn, key, message);
	});
	conn.on('close', (code, desc) => {
		// console.log('client socket closed connection');
		// console.log(desc);
			try {
			desc = parseJson(desc);
			let ary = getClients(desc.roomName);
			if (ary.length) {
				ary.filter((registerdConn) => registerdConn !== conn).map((registerdConn) => {
					if (registerdConn) {
						registerdConn.sendUTF(
							toJson({
								type: 'exitRoom',
								message: desc.message,
							})
						);
					}
				});

				deleteClients(desc.roomName);
			}
		} catch (e) {
			console.error(e);
		}
	});
}

/**
 *
 * @param {objct} request  https client request object
 * @description handler for the onrequest event in the websocket server.
 * @return {undefined} undefined
 */
function wsHandler(request) {
	if (!originIsAllowed(request.origin)) {
		request.reject(405);
		console.log(new Date(), ' Connection from origin ', request.origin, ' rejected.'); ////remove in production
		return;
	}
	//client socket being established.
	const conn = request.accept('echo-protocol', request.origin);
	console.log('connection accepted.'); //remove in production
	wsConn(conn);
}
module.exports = { wsHandler };
