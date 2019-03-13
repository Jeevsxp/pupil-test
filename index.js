const AWS = require('aws-sdk');
var s3 = new AWS.S3();
var sns = new AWS.SNS({apiVersion: '2010-03-31'});
const TopicArn = 'arn:aws:sns:eu-west-2:944804548030:pupil';
const Joi = require('joi');
/* Using Joi to validate input
	 s3 Object Key Naming Guidelines: https://docs.aws.amazon.com/AmazonS3/latest/dev/UsingMetadata.html
	 s3 rules for naming S3 buckets: https://docs.aws.amazon.com/AmazonS3/latest/dev/BucketRestrictions.html
	 with more time would have made the regex closer to the spec.
*/
const schema = Joi.object().keys({
			bucket:Joi.string().regex(/^[0-9a-z][0-9a-z.-]{2,62}$/).required(),
			key:Joi.string().regex(/^[0-9a-zA-Z!\-_.*'()]+$/).required()
	});
exports.handler = (event, context, callback) => {
	console.log(event);
	Joi.validate(event,schema)
		.then(input=>s3.getObject({Bucket:input.bucket,Key:input.key}).promise())
		.then(data=>{
			return data.Body
					.toString()
					.split('\n')
					.map(line=>{
						let lineSegment=line.split(' ');
						return {id:lineSegment[0],status:lineSegment[1]};
					});
		})
		.then(lines=>{
			let notificationResponses=[];
			lines.forEach(line=>{
				if(line.status==='SUCCEEDED'){
					/* publishDate would require more formatting, SNS also returns a 'Timestamp' field so this field might not be necessary*/
					line.publishDate=Date.now();
					notificationResponses.push(sns.publish({Message:JSON.stringify(line),TopicArn}).promise());
				}
			})
			return Promise.all(notificationResponses);
		})
		.then(responses=>{
				console.log(`Messages sent to the topic ${TopicArn}`);
				responses.forEach(response=>{
					console.log("MessageID is " + JSON.stringify(response.MessageId));
				});
				callback(null,`Messages sent to the topic ${TopicArn}`);
		})
		.catch(err=>{
					console.error(err, err.stack);
					/* would handle errors differently given more context, custom error messages etc. */
					callback(err);
			});
};