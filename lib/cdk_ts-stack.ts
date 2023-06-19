import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration} from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';

export class CdkTsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sharedLambdaProps: Partial<NodejsFunctionProps> = {
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
