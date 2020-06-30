// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.


const { MessageFactory, InputHints } = require('botbuilder');
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
const { ErrorDialog } = require('./errorDialog');
const { BtDialog } =require('./btDialog')

const axios= require('axios');

const BT_DIALOG='btDialog'
const ERROR_DIALOG ='errorDailog';

var totalApp='';
var inputApp='';
var appTier='';

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const TEXT_PROMPT = 'textPrompt';
const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

class ApplicationDialog extends ComponentDialog {
    constructor() {
        super( 'applicationDialog');

        
       
        // Define the main dialog and its related components.
        // This is a sample "book a flight" dialog.
        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new BtDialog(BT_DIALOG))
            .addDialog(new ErrorDialog(ERROR_DIALOG))
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.appStep.bind(this),
                this.appCheckStep.bind(this),
                this.appTierStep.bind(this),
                this.appActionStep.bind(this),
                this.appActionChoiceStep.bind(this)
                ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    /**
     * First step in the waterfall dialog. Prompts the user for a command.
     * Currently, this expects a booking request, like "book me a flight from Paris to Berlin on march 22"
     * Note that the sample LUIS model will only recognize Paris, Berlin, New York and London as airport cities.
     */
    async appStep(step) {
            
        await axios.get(`https://amelia202006281753585.saas.appdynamics.com/controller/rest/applications?output=json`,
        {
          auth:
          {
            username: 'amelia202006281753585@amelia202006281753585',
            password: 'nghn94uju0t8'
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

    async appCheckStep(step)
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
          return await step.beginDialog('applicationDialog');
        }
        else{
            return await step.next();
        }

    }
    async appTierStep(step)
    {
        await axios.get(`https://amelia202006281753585.saas.appdynamics.com/controller/rest/applications/${inputApp}/tiers?output=json`,
        {
          auth:
          {
            username: 'amelia202006281753585@amelia202006281753585',
            password: 'nghn94uju0t8'
          }
        }).then((result) =>{   
            appTier=result.data[0].name;
        });   
        return await step.next();
    }
    async appActionStep(step)
    {
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Hi! How can I help u with?',
            choices: ChoiceFactory.toChoices(['Business-transactions','Service Endpoints','Tiers & Nodes','Servers','Containers','Database Calls','Remote Services'])
        });
    }
    
    async appActionChoiceStep(step)
    {
        if(step.result.value=='Business-transactions'){
            return await step.beginDialog(BT_DIALOG, {app : inputApp, tier : appTier});
        }
        else if(step.result.value=='Service Endpoints'){
            
            step.context.sendActivity("Work in Progress");
            return await step.endDialog();
        }
        else if(step.result.value=='Tiers & Nodes'){
            
            step.context.sendActivity("Work in Progress");
            return await step.endDialog();
        }
        else if(step.result.value=='Servers'){
            
            step.context.sendActivity("Work in Progress");
            return await step.endDialog();
        }
        else if(step.result.value=='Containers'){
            
            step.context.sendActivity("Work in Progress");
            return await step.endDialog();
        }
        else if(step.result.value=='Database Calls'){
            
            step.context.sendActivity("Work in Progress");
            return await step.endDialog();
        }
        else if(step.result.value=='Remote Services'){
            
            step.context.sendActivity("Work in Progress");
            return await step.endDialog();
        }
        else{}
    }
          
}

module.exports.ApplicationDialog = ApplicationDialog;
