import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda'

export class GreengrassLambdaStack extends cdk.Stack {
  public readonly greengrassLmbdaAlias: lambda.Alias;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const greengrassLambda = new lambda.Function(this, 'GreengrassSampleHandler', {
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.asset('handles'),
      handler: 'handler.handler'
    })
    const version = greengrassLambda.addVersion('GreengrassSampleVersion')

    this.greengrassLmbdaAlias = new lambda.Alias(this, 'GreengrassSampleAlias', {
      aliasName: 'raspberrypi',
      version: version
    })
  }
}
