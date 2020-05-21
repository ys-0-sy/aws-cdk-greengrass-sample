#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { GreengrassRaspberryPiStack } from '../lib/greengrass-raspbery-pi-stack'
import { GreengrassLambdaStack } from '../lib/greengrass-lambda-stack'


const app = new cdk.App()

const lambdaStack = new GreengrassLambdaStack(app, 'GreengrassLambdaStack')
new GreengrassRaspberryPiStack(app, 'GreengrassRaspberryPiStack', {
  greengrassLambdaAlias: lambdaStack.greengrassLmbdaAlias
})
