import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration} from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export class CdkTsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sharedLambdaProps: Partial<NodejsFunctionProps> = { ///tu na wideo jest duzo wiecej propsow 21:43
      runtime: lambda.Runtime.NODEJS_18_X,
      role: iam.Role.fromRoleArn(this, "DynamoDBLambdaAccess", "arn:aws:iam::585154451279:role/DynamoDBLambdaAccessRole"),
    }

    const getProductsList = new NodejsFunction(this, 'GetProductsListLambda', {
      ...sharedLambdaProps,
      functionName: 'getProductsList',
      entry: 'src/handlers/getProductsList.ts'
    });

    const getProductById = new NodejsFunction(this, 'GetProductByIdLambda', {
      ...sharedLambdaProps,
      functionName: 'getProductById',
      entry: 'src/handlers/getProductById.ts'
    });

    const createProduct = new NodejsFunction(this, 'createProductLambda', {
      ...sharedLambdaProps,
      functionName: 'createProduct',
      entry: 'src/handlers/createProduct.ts'
    });

    const importQueue = new sqs.Queue(this, 'importQueue', {
      queueName: 'import-file-queue',
    });

    const importProductTopic = new sns.Topic(this, 'importProductTopic', {
      topicName: 'import-product-topic',
    });

    new sns.Subscription(this, 'StockSubscription', {
      endpoint: 'sliwinski.nowtec@gmail.com',
      protocol: sns.SubscriptionProtocol.EMAIL,
      topic: importProductTopic,
    });

    const catalogBatchProcess = new NodejsFunction(this, 'CatalogBatchProcessLambda', {
      ...sharedLambdaProps,
      functionName: 'catalogBatchProcess',
      entry: 'src/handlers/catalogBatchProcess.ts',
    });

    importProductTopic.grantPublish(catalogBatchProcess);
    catalogBatchProcess.addEventSource(new SqsEventSource(importQueue, { batchSize: 5 }));

    const api = new apiGateway.HttpApi(this, 'ProductApi', {
      corsPreflight: {
        allowHeaders: ['*'],
        allowOrigins: ['*'],
        allowMethods: [apiGateway.CorsHttpMethod.ANY],
      },
    });

    api.addRoutes({
      integration: new HttpLambdaIntegration('GetProductsListIntegration', getProductsList),
      path: '/products',
      methods: [apiGateway.HttpMethod.GET],
    });

    api.addRoutes({
      integration: new HttpLambdaIntegration('GetProductsListIntegration', getProductById),
      path: '/products/{id}',
      methods: [apiGateway.HttpMethod.GET],
    });

    api.addRoutes({
      integration: new HttpLambdaIntegration('createProductIntegration', createProduct),
      path: '/products',
      methods: [apiGateway.HttpMethod.POST],
    });
  }
}
