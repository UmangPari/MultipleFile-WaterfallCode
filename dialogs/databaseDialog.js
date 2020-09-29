const { InputHints, MessageFactory } = require('botbuilder');
const axios=require('axios');
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
const{ DbNameDialog }=require('./dbNameDialog');
const DBNAME_DIALOG='dbNameDialog';
var info;
var inputDB;
var appdLink='https://theater202009172349223.saas.appdynamics.com';
var appdUserName='theater202009172349223@theater202009172349223';
var appdPassword='vdrv1icvgblr';

const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class DatabaseDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'databaseDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new DbNameDialog(DBNAME_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.appNameStep.bind(this),
                this.functionStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

   async appNameStep(step){
     
     return await step.beginDialog(DBNAME_DIALOG,{app: inputDB});

    }
    async functionStep(step)
    
    {
        inputDB=step.result;
        await axios.get(`${appdLink}/controller/rest/applications/Database%20Monitoring/metric-data?metric-path=Databases%7C${inputDB}%7CKPI%7CCalls%20per%20Minute&time-range-type=BEFORE_NOW&duration-in-mins=1440&output=json`,
            {               
              auth:
                {
                  username: appdUserName,
                  password: appdPassword
                }
            }).then((result) =>{   
              if(result.data[0].metricValues.length!=0)
              {
               step.context.sendActivity("Calls Per Minute : "+result.data[0].metricValues[0].count.toString());
              }
              else
              {
                step.context.sendActivity("No calls per minute found");
              }      
          });
           

            await axios.get(`${appdLink}/controller/rest/applications/Database%20Monitoring/metric-data?metric-path=Databases%7C${inputDB}%7CKPI%7CDB%20Availability&time-range-type=BEFORE_NOW&duration-in-mins=1440&output=json`,
            {               
              auth:
                {
                  username: appdUserName,
                  password: appdPassword
                }
            }).then((result) =>{   
              if(result.data[0].metricValues.length!=0)
              {
                step.context.sendActivity("DB Availability : "+result.data[0].metricValues[0].current.toString());
              }
              else
              {
                step.context.sendActivity("No db availability found");
              }
            });
            await axios.get(`${appdLink}/controller/rest/applications/Database%20Monitoring/metric-data?metric-path=Databases%7C${inputDB}%7CKPI%7CNumber%20of%20Connections&time-range-type=BEFORE_NOW&duration-in-mins=1440&output=json`,
            {               
              auth:
                {
                  username: appdUserName,
                  password: appdPassword
                }
            }).then((result) =>{   
              if(result.data[0].metricValues.length!=0)
              {
                step.context.sendActivity("No Of Connections : "+result.data[0].metricValues[0].count.toString());
              }
              else
              {
                step.context.sendActivity("No connections found");
              }
              
            });
            await axios.get(`${appdLink}/controller/rest/applications/Database%20Monitoring/metric-data?metric-path=Databases%7C${inputDB}%7CKPI%7CTime%20Spent%20in%20Executions%20%28s%29&time-range-type=BEFORE_NOW&duration-in-mins=1440&output=json`,
            {               
              auth:
                {
                  username: appdUserName,
                  password: appdPassword
                }
            }).then((result) =>{   
              if(result.data[0].metricValues.length!=0)
              {
                step.context.sendActivity("Time spent in execution (Sec): "+result.data[0].metricValues[0].count.toString());
              }
              else
              {
                step.context.sendActivity("No time spent found");
              } 
              
            });
            return await step.endDialog();


     }
  }

      
  
module.exports.DatabaseDialog = DatabaseDialog;
