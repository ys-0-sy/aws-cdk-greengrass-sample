#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsCdkGreengrassSampleStack } from '../lib/aws-cdk-greengrass-sample-stack';

const app = new cdk.App();
new AwsCdkGreengrassSampleStack(app, 'AwsCdkGreengrassSampleStack');
