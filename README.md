# pupil-test

API endpoint
--------------
POST https://ozrqhax81b.execute-api.eu-west-2.amazonaws.com/PROD/notification-queue   
```
body
{
  "key":"test.txt",
  "bucket":"pupil-test"
}
```

SNS
----
arn:aws:sns:eu-west-2:944804548030:pupil

ToDo
-----
Currently no auth implemented on API Gateway, would set up IAM, api key or token based auth based on usage requirement.
