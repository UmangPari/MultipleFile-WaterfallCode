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
const { TimeRangeDialog } = require('./timeRangeDialog');

const TIMERANGE_DIALOG = 'timeRangeDialog';

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

var inputApp='aa';
var info='';
var startRange='0';
var endRange='0';
var finalRange='';
var timeRangeFlag=-1;
var appTier='';

class BtDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'btDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new TimeRangeDialog(TIMERANGE_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.appStep.bind(this),
                this.infoStep.bind(this),
                this.timeRangeStep.bind(this),
                this.appModelApiStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async appStep(step)
    {
      inputApp = step.options.app;
      appTier=step.options.tier;
    
      return await step.next(); 
    }
         
    async infoStep(step)
    {
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
                                                'top 5 business transactions by stalls'
                                              ])
                });
        
        

    }   
    async timeRangeStep(step)
    {
      info=step.result.value;

      if(info=='top 10 business transactions by response time' 
        || info=='transactions between time ranges' 
        || info=='excluded business transactions generated between given time range'
        || info=='Top 10 business-transactions by load'
        || info=='top 5 business transactions by Errors'
        || info=='top 10 business transactions by slow transactions'
        || info=='transactions between time ranges'
        || info=='top 5 business transactions by App Average Response time'
        || info=='top 5 business transactions bt stalls')
      {
        timeRangeFlag=1; 
        return await step.beginDialog(TIMERANGE_DIALOG, {range : finalRange});
      }
      return await step.next();
    }

    async appModelApiStep(step)
    {
      if(timeRangeFlag==1)
      {
        startRange = step.result.split(" ")[0];
        endRange = step.result.split(" ")[1];      
      }
      var btName = new Array();

       await axios.get(`https://amelia202006281753585.saas.appdynamics.com/controller/rest/applications/${inputApp}/business-transactions?output=json`,
       {
        auth:
        {
          username: 'amelia202006281753585@amelia202006281753585',
          password: 'nghn94uju0t8'
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
        var btValue = new Array(); 

          var btCount=10;
       if(btName.length<10)
       {
         btCount=btName.length;
       }
       for(var i=0;i<btName.length;i++)
          {    
            await axios.get(`https://amelia202006281753585.saas.appdynamics.com/controller/rest/applications/${inputApp}/metric-data?metric-path=Business%20Transaction%20Performance%7CBusiness%20Transactions%7C${appTier}%7C${btName[i]}%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BEFORE_NOW&duration-in-mins=${startRange}&output=json`,
            {               
              auth:
                {
                  username: 'amelia202006281753585@amelia202006281753585',
                  password: 'nghn94uju0t8'
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
    else if(info=='Top 10 business-transactions by load')
    {
       var btSum = new Array(); 
      var btCount=10;

       if(btName.length<10)
       {
         btCount=btName.length;
       }
       for(var i=0;i<btName.length;i++)
          {    
            await axios.get(`https://amelia202006281753585.saas.appdynamics.com/controller/rest/applications/${inputApp}/metric-data?metric-path=Business%20Transaction%20Performance%7CBusiness%20Transactions%7C${appTier}%7C${btName[i]}%7CCalls%20per%20Minute&time-range-type=BEFORE_NOW&duration-in-mins=${startRange}&output=json`,
            {               
              auth:
                {
                  username: 'amelia202006281753585@amelia202006281753585',
                  password: 'nghn94uju0t8'
                }
            }).then((result) =>{   
                var outerData = result.data;
                
                if(outerData[0].metricValues.length!=0)
                {
                btSum[i] = outerData[0].metricValues[0].sum;    
                }
                else
                {
                  btName.splice(i,1);
                }
            });
          }
          var temp=0;
          for (var i = 0; i < btSum.length; i++) 
          {
              for (var j = i + 1; j < btSum.length; j++) { 
                  if (btSum[i] < btSum[j]) 
                  {
                      temp = btSum[i];
                      btSum[i] = btSum[j];
                      btSum[j] = temp;

                      temp = btName[i];
                      btName[i] = btName[j];
                      btName[j] = temp;
                  }
              }
            }
            for(var i=0;i<btCount;i++)
            {
              step.context.sendActivity(btName[i]+'  '+btSum[i]);
            }
    }  
    else if(info == 'excluded business transactions generated between given time range')
    {
        await axios.get(`https://amelia202006281753585.saas.appdynamics.com/controller/rest/applications/${inputApp}/business-transactions?exclude=true&output=json`,
      {
       auth:
       {
         username: 'amelia202006281753585@amelia202006281753585',
         password: 'nghn94uju0t8'
       }
      }).then((result) => 
      {
        for(var i=0;i<result.data.length;i++)
        {
          step.context.sendActivity(result.data[i].name);
        }
      });

    } 
    else if(info == 'top 5 business transactions by Errors')
    {
      var btSum = new Array(); 
      var btCount=5;

       if(btName.length<5)
       {
         btCount=btName.length;
       }
       for(var i=0;i<btName.length;i++)
          {    
            await axios.get(`https://amelia202006281753585.saas.appdynamics.com/controller/rest/applications/${inputApp}/metric-data?metric-path=Business%20Transaction%20Performance%7CBusiness%20Transactions%7C${appTier}%7C${btName[i]}%7CErrors%20per%20Minute&time-range-type=BEFORE_NOW&duration-in-mins=${startRange}&output=json`,
            {               
              auth:
                {
                  username: 'amelia202006281753585@amelia202006281753585',
                  password: 'nghn94uju0t8'
                }
            }).then((result) =>{   
                var outerData = result.data;
                if(outerData.length!=0)
                { 
               if(outerData[0].metricValues.length!=0)
                {
                  btSum[i] = outerData[0].metricValues[0].sum;    
                }
                else
                {
                  btSum[i]=0;
                }
              }
              else
              {
                btSum[i]=0;
              }
                
            });
          }
          var temp=0;
          for (var i = 0; i < btSum.length; i++) 
          {
              for (var j = i + 1; j < btSum.length; j++) { 
                  if (btSum[i] < btSum[j]) 
                  {
                      temp = btSum[i];
                      btSum[i] = btSum[j];
                      btSum[j] = temp;

                      temp = btName[i];
                      btName[i] = btName[j];
                      btName[j] = temp;
                  }
              }
            }
            var count=0;
            for(var i=0; i<btName.length;i++)
            {
              if(btSum[i]==0)
              {
                break;
              }
              else
              {
                count++;
              }
            }

            if(count<btCount)
            { btCount=count;
            }

            for(var i=0;i<btCount;i++)
            {
              step.context.sendActivity(btName[i] + '  ' + btSum[i]);
            }
    }
    else if(info=='top 10 business transactions by slow transactions')
    {
      var btValue = new Array(); 

      var btCount=10;
   if(btName.length<10)
   {
     btCount=btName.length;
   }
   for(var i=0;i<btName.length;i++)
      {    
        await axios.get(`https://amelia202006281753585.saas.appdynamics.com/controller/rest/applications/${inputApp}/metric-data?metric-path=Business%20Transaction%20Performance%7CBusiness%20Transactions%7C${appTier}%7C${btName[i]}%7CNumber%20of%20Slow%20Calls&time-range-type=BEFORE_NOW&duration-in-mins=${startRange}&output=json`,
        {               
          auth:
            {
              username: 'amelia202006281753585@amelia202006281753585',
              password: 'nghn94uju0t8'
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
        var count=0;
            for(var i=0; i<btName.length;i++)
            {
              if(btValue[i]==0)
              {
                break;
              }
              else
              {
                count++;
              }
            }

            if(count<btCount)
            { btCount=count;
            }

        for(var i=0;i<btCount;i++)
        {
          step.context.sendActivity(btName[i]+'  '+btValue[i]);
        }

    }
    else if(info=='Latest business Transactions')
    {
      var latestBtCount=0, latestBt='';

      for(var i=0;i<btName.length;i++)
      {
      await axios.get(`https://amelia202006281753585.saas.appdynamics.com/controller/rest/applications/${inputApp}/metric-data?metric-path=Business%20Transaction%20Performance%7CBusiness%20Transactions%7C${appTier}%7C${btName[i]}%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BEFORE_NOW&duration-in-mins=11520&output=json`,
      {               
        auth:
          {
            username: 'amelia202006281753585@amelia202006281753585',
            password: 'nghn94uju0t8'
          }
      }).then((result) =>{   
          var outerData = result.data;
          
          if(outerData[0].metricValues.length!=0)
          {
            if(latestBtCount < outerData[0].metricValues[0].startTimeInMillis)
            {
              latestBtCount = outerData[0].metricValues[0].startTimeInMillis;
              latestBt=btName[i];    
            } 
          }
      });
      }
      step.context.sendActivity('Latest business transaction is '+latestBt);
   }
   else if(info=='transactions between time ranges')
   {
    await axios.get(`https://amelia202006281753585.saas.appdynamics.com/controller/rest/applications/${inputApp}/business-transactions?time-range-type=BETWEEN_TIMES&start-time=${startRange}&end-time=${endRange}&output=json`,
    {
     auth:
     {
       username: 'amelia202006281753585@amelia202006281753585',
       password: 'nghn94uju0t8'
     }
    }).then((result) => 
    {
      for(var i=0;i<result.data.length;i++)
      {
        step.context.sendActivity(result.data[i].name);
      }
    });
   }
   else if(info=='top 5 business transactions by App Average Response time')
   {

   }
   else if(info=='top 5 business transactions by stalls')
   {
    var btValue = new Array(); 

    var btCount=5;
 if(btName.length<5)
 {
   btCount=btName.length;
 }
 for(var i=0;i<btName.length;i++)
    {    
      await axios.get(`https://amelia202006281753585.saas.appdynamics.com/controller/rest/applications/${inputApp}/metric-data?metric-path=Business%20Transaction%20Performance%7CBusiness%20Transactions%7C${appTier}%7C${btName[i]}%7CStall%20Count&time-range-type=BEFORE_NOW&duration-in-mins=${startRange}&output=json`,
      {               
        auth:
          {
            username: 'amelia202006281753585@amelia202006281753585',
            password: 'nghn94uju0t8'
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
   else{}
    return await step.endDialog();
            
  } 
}
module.exports.BtDialog = BtDialog;
