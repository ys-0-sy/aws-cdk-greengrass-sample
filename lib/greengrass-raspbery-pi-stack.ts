import * as cdk from '@aws-cdk/core'
import * as iot from '@aws-cdk/aws-iot'
import * as lambda from '@aws-cdk/aws-lambda'
import * as greengrass from '@aws-cdk/aws-greengrass'
import { clearScreenDown } from 'readline'

interface GreengrassRaspberryPiStackProps extends cdk.StackProps {
  greengrassLambdaAlias: lambda.Alias
}

export class GreengrassRaspberryPiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: GreengrassRaspberryPiStackProps) {
    super(scope, id, props)

    const certArn: string = "arn:aws:iot:ap-northeast-1:840465541073:cert/dbf2bc6269be1c3e3f42e57a6f243235daa96d61c27fabef8d55a2d80c649451"
    const region: string = cdk.Stack.of(this).region
    const accountId: string = cdk.Stack.of(this).account

    const iotThing = new iot.CfnThing(this, 'Thing', {
      thingName: 'Raspberry_Pi_Thing'
    })

    if (iotThing.thingName !== undefined) {
      const thingArn = `arn:aws:iot:${region}:${accountId}:thing/${iotThing.thingName}`

      const iotPolicy = new iot.CfnPolicy(this, 'Policy', {
        policyName: 'Raspberry_Pi_Policy',
        policyDocument: {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Action": [
                "iot:*",
                "greengrass:*",
              ],
              "Resource": [
                "*"
              ]
            }
          ]
        }
      })
      iotPolicy.addDependsOn(iotThing)

      if (iotPolicy.policyName !== undefined) {
        const policyPrincipalAttachment = new iot.CfnPolicyPrincipalAttachment(this, 'PolicyPrincipalAttachment', {
          policyName: iotPolicy.policyName,
          principal: certArn
        })
        policyPrincipalAttachment.addDependsOn(iotPolicy)
      }

      const thingPrincilatAttachment = new iot.CfnThingPrincipalAttachment(this, "ThingPrincipalAttachment", {
        thingName: iotThing.thingName,
        principal: certArn
      })
      thingPrincilatAttachment.addDependsOn(iotThing)

      const coreDefinition = new greengrass.CfnCoreDefinition(this, 'CoreDefinition', {
        name: 'Raspberry_Pi_Core',
        initialVersion: {
          cores: [
            {
              certificateArn: certArn,
              id: '1',
              thingArn: thingArn
            }
          ]
        }
      })
      coreDefinition.addDependsOn(iotThing)

      const resourceDefinition = new greengrass.CfnResourceDefinition(this, 'ResourceDefinition', {
        name: 'Raspberry_Pi_Resource',
        initialVersion: {
          resources: [
            {
              id: '1',
              name: 'log_file_resource',
              resourceDataContainer: {
                localVolumeResourceData: {
                  sourcePath: '/log',
                  destinationPath: '/log'
                }
              }
            }
          ]
        }
      })

      const functioDefinition = new greengrass.CfnFunctionDefinition(this, 'FunctionDefinition', {
        name: 'Raspberry_Pi_Function',
        initialVersion: {
          functions: [
            {
              id: '1',
              functionArn: props.greengrassLambdaAlias.functionArn,
              functionConfiguration: {
                encodingType: 'binary',
                memorySize: 65536,
                pinned: true,
                timeout: 3,
                environment: {
                  resourceAccessPolicies: [
                    {
                      resourceId: '1',
                      permission: 'rw'
                    }
                  ]
                }
              }
            }
          ]
        }
      })

      const group = new greengrass.CfnGroup(this, 'Group', {
        name: 'Raspberry_Pi',
        initialVersion: {
          coreDefinitionVersionArn: coreDefinition.attrLatestVersionArn,
          resourceDefinitionVersionArn: resourceDefinition.attrLatestVersionArn,
          functionDefinitionVersionArn: functioDefinition.attrLatestVersionArn
        }
      })

      group.addDependsOn(coreDefinition)
      group.addDependsOn(resourceDefinition)
      group.addDependsOn(functioDefinition)
    }
  }
}
