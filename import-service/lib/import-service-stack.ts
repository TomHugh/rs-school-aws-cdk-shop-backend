import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration} from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3notifications from 'aws-cdk-lib/aws-s3-notifications';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sharedLambdaProps: Partial<NodejsFunctionProps> = {
      runtime: lambda.Runtime.NODEJS_18_X,
      // role: iam.Role.fromRoleArn(this, "DynamoDBLambdaAccess", "arn:aws:iam::585154451279:role/DynamoDBLambdaAccessRole"),
    }

    const bucket = s3.Bucket.fromBucketName(this, "ImportBucket", "rs-school-shop-app-products-files");

    const importProductsFile = new NodejsFunction(this, 'ImportProductsFileLambda', {
      ...sharedLambdaProps,
      functionName: 'importProductsFile',
      entry: 'src/handlers/importProductsFile.ts'
    });

    bucket.grantReadWrite(importProductsFile);

    const importFileParser = new NodejsFunction(this, 'ImportFileParserLambda', {
      ...sharedLambdaProps,
      functionName: 'importFileParser',
      entry: 'src/handlers/importFileParser.ts'
    });

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3notifications.LambdaDestination(importFileParser),
      {prefix: 'uploaded/', suffix: '.csv'}
    );

    bucket.grantReadWrite(importFileParser);

    const api = new apiGateway.HttpApi(this, 'ImportProductApi', {
      corsPreflight: {
        allowHeaders: ['*'],
        allowOrigins: ['*'],
        allowMethods: [apiGateway.CorsHttpMethod.ANY],
      },
    });

    api.addRoutes({
      integration: new HttpLambdaIntegration('ImportProductsFileIntegration', importProductsFile),
      path: '/import',
      methods: [apiGateway.HttpMethod.GET],
    });

    // api.addRoutes({
    //   integration: new HttpLambdaIntegration('GetProductsListIntegration', getProductById),
    //   path: '/products/{id}',
    //   methods: [apiGateway.HttpMethod.GET],
    // });

    
  }
}

