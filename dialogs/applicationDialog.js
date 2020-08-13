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
const{ AppNameDialog }=require('./appNameDialog');

const axios= require('axios');


var appdLink='https://chaplin202008130019254.saas.appdynamics.com';
var appdUserName='chaplin202008130019254@chaplin202008130019254';
var appdPassword='lb19y0vkgnwf';

const BT_DIALOG='btDialog';
const APPNAME_DIALOG='appNameDialog'
const ERROR_DIALOG ='errorDailog';

var totalApp='';
var inputApp='null';
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
            .addDialog(new AppNameDialog(APPNAME_DIALOG))
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.appStep.bind(this),
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

   
    async appStep(step) {
        return await step.beginDialog(APPNAME_DIALOG,{app: inputApp});
    }
    async appTierStep(step)
    {   
        inputApp=step.result;
       await axios.get(`${appdLink}/controller/rest/applications/${inputApp}/tiers?output=json`,
        {
          auth:
          {
            username: appdUserName,
            password: appdPassword
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
