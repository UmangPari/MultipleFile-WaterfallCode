// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { InputHints, MessageFactory } = require('botbuilder');
const {
    AttachmentPrompt,
    ChoiceFactory,
    ChoicePrompt,
    ComponentDialog,
    ConfirmPrompt,
    DialogSet,
    DialogTurnStatus,
    NumberPrompt,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');
const axios = require('axios');

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

var inputApp='';
var info='';
var totalApp='';

class AppModelDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'appModelDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.appStep.bind(this),
                this.infoStep.bind(this),
                this.appModelApiStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async appStep(step)
    {
      await axios.get(`https://davinci202006102213579.saas.appdynamics.com/controller/rest/applications?output=json`,
      {
        auth:
        {
          username: 'davinci202006102213579@davinci202006102213579',
          password: 'gddmj89nwy1k'
        }
      }).then((result) =>{   
       totalApp=result.data;
      });  
      for(var i=0;i<totalApp.length;i++)
      {
        step.context.sendActivity(totalApp[i].name);
      }
         return await step.prompt(TEXT_PROMPT,'hello! Please enter app name from above list');
    }
         
    async infoStep(step)
    {
      var flag=-1;
        inputApp=step.result;
        for(var i=0;i<totalApp.length;i++)
        {
          if(totalApp[i].name=inputApp)
          {
            flag=1;
            break;
          }
        } 
        if(flag==-1)
        {
          step.context.sendActivity('Sorry! You entered wrong name');
          return await step.beginDialog('appModelDialog');
        }
        
           return await step.prompt(CHOICE_PROMPT, {
              prompt: 'Please choose the info u want to know.',
              choices: ChoiceFactory.toChoices(['Latest business Transactions',
                                                'Top 10 business-transactions by load',
                                                'transactions between time ranges',
                                                'top 10 business transactions by response time',
                                                'excluded business transactions generated between given time range',
                                                'top 5 business transactions by Errors',
                                                'top 5 business transactions by App Average Response time',
                                                'top 10 business transactions by slow transactions',
                                                'top 10 business transactions by health rule violations'
                                              ])
                });
        
        
    }   
    async appModelApiStep(step)
    {
      info=step.result.value;
      
      
       var btName = new Array();
       var btValue = new Array(); 
       await axios.get(`https://davinci202006102213579.saas.appdynamics.com/controller/rest/applications/${inputApp}/business-transactions?output=json`,
       {
        auth:
        {
          username: 'davinci202006102213579@davinci202006102213579',
          password: 'gddmj89nwy1k'
        }
       }).then((result) => 
       {
         for(var i=0;i<result.data.length;i++)
         {      
          btName[i]=result.data[i].name;     
         }  
       });
       if(info=='top 10 business transactions by response time')
       { 
       var btCount=10;
       if(btName.length<10)
       {
         btCount=btName.length;
       }
       for(var i=0;i<btName.length;i++)
          {    
            await axios.get(`https://davinci202006102213579.saas.appdynamics.com/controller/rest/applications/KonaKart/metric-data?metric-path=Business%20Transaction%20Performance%7CBusiness%20Transactions%7CTomcatSamples%7C${btName[i]}%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BEFORE_NOW&duration-in-mins=120&output=json`,
            {               
              auth:
                {
                  username: 'davinci202006102213579@davinci202006102213579',
                  password: 'gddmj89nwy1k'
                }
            }).then((result) =>{   
                var outerData = result.data;
                
                if(outerData[0].metricValues.length!=0)
                {
                btValue[i] = outerData[0].metricValues[0].value;    
                }
                else
                {
                  btName.splice(i,1);
                }
            });
          }
         var temp=0;
          for (var i = 0; i < btValue.length; i++) 
          {
              for (var j = i + 1; j < btValue.length; j++) { 
                  if (btValue[i] < btValue[j]) 
                  {
                      temp = btValue[i];
                      btValue[i] = btValue[j];
                      btValue[j] = temp;

                      temp = btName[i];
                      btName[i] = btName[j];
                      btName[j] = temp;
                  }
              }
            }
            for(var i=0;i<btCount;i++)
            {
              step.context.sendActivity(btName[i]+'  '+btValue[i]);
            }
    } 
    else if(info=='top 5 business transactions by Errors')
    {
      
    }       
    return await step.endDialog();
            
  } 
}
module.exports.AppModelDialog = AppModelDialog;
