
// Google Cloud Functions api
const functions = require('firebase-functions');

// Square Payments api
const SquareConnect = require('square-connect');

// Crypto api
const crypto = require('crypto');

// Generats a function that will take in a nonce and process a payment using cloud functions.
exports.squarepaymentfx = functions.https.onCall(async (data, context) => {

	//Take the client instance , setup environment variables , and fire up the payments api.
	//defaultClient.basePath = process.env.TESTING_SQUARE_CONNECT_URL;		
	const defaultClient = SquareConnect.ApiClient.instance;
	defaultClient.basePath = process.env.TOKEN_SQUARE_CONNECT_URL;
	const oauth2 = defaultClient.authentications["oauth2"];
	oauth2.accessToken = process.env.TOKEN_APPLICATION_ACCESS_TOKEN;
	const idempotency_key = crypto.randomBytes(16).toString("hex");
	const payments_api = new SquareConnect.PaymentsApi();
	
	// Value of amount is in cents as of 04/10/2020, 1 is equal to 1 cent, 100 is equal to 100 cents.
	const request_body = {
		"idempotency_key": idempotency_key,
		"source_id": data.source_id,
		"amount_money": {
			"amount": 100,
			"currency": "USD"
		},
	};

	// Promise me you'll make a payment using the details provided in the request body
	// When you're done promise me to resolve on the response if there's an error promise me you'll tell me about it.
	// Return ma data in the JSON format, thank you, I'll wait asynchronously for your promise.
	try{
		response = await payments_api.createPayment(request_body)
		.then( 
			r=> {
				if(r.ok) { return Promise.resolve(r); }
				return Promise.reject(Error("TRY ERROR_ON_RESPONSE: " + JSON.stringify(r)))
		})
		.catch( 
			e=> {
				return Promise.reject(Error("TRY ERROR_ON_EXCEPTION: " + JSON.stringify(e)))
		});
		return "TRY OKAY: " + JSON.stringify(response);
	} catch(error){
		return "CATCH ERROR: " + JSON.stringify(error);
	}
});
