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
const { ApplicationDialog }= require('./applicationDialog');
const { AlertRespondDialog }= require('./alertRespondDialog');

const ALERTRESPOND_DIALOG= 'alertRespondDialog';
const BT_DIALOG='btDialog'
const ERROR_DIALOG ='errorDailog';
const APPLICATION_DIALOG='applicationDialog';
const Main_Dialog='MainDialog';

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const TEXT_PROMPT = 'textPrompt';
const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

class MainDialog extends ComponentDialog {
    constructor() {
        super( 'MainDialog');

        
       
        // Define the main dialog and its related components.
        // This is a sample "book a flight" dialog.
        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new BtDialog(BT_DIALOG))
            .addDialog(new ErrorDialog(ERROR_DIALOG))
            .addDialog(new ApplicationDialog(APPLICATION_DIALOG))
            .addDialog(new AlertRespondDialog(ALERTRESPOND_DIALOG))
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.introStep.bind(this),
                this.actStep.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)
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
    async introStep(step) {
            
        
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Hi! How can I help u with?',
            choices: ChoiceFactory.toChoices(['Applications', 'User Experience','DataBases','Servers','Reports','Alert&Respond'])
        });
    }

    /**
     * Second step in the waterfall.  This will use LUIS to attempt to extract the origin, destination and travel dates.
     * Then, it hands off to the bookingDialog child dialog to collect any remaining details.
     */
    async actStep(step) 
    {
        
        if(step.result.value=='Applications')
        {
            return await step.beginDialog(APPLICATION_DIALOG);
            
        }
        else if(step.result.value=='User Experience')
        {
            step.context.sendActivity("Work in Progress");
            return await step.next();
        }
        else if(step.result.value=='DataBases')
        {
            step.context.sendActivity("Work in Progress");
            return await step.next();
        }
        else if(step.result.value=='Servers')
        {
            step.context.sendActivity("Work in Progress");
            return await step.next();
        }
        else if(step.result.value=='Reports')
        {
            step.context.sendActivity("Work in Progress");
            return await step.next();
        }
        else if(step.result.value=='Alert&Respond')
        {
            return await step.beginDialog(ALERTRESPOND_DIALOG);
        }
        else{}
        
    }

    async confirmStep(step)
    {
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Any more Info?',
            choices: ChoiceFactory.toChoices(['yes', 'no'])
        });
    }   

    async finalStep(step)
    {
        if(step.result.value=='yes')
        {
           return await step.beginDialog(Main_Dialog);
        }
        else
        {   
            step.context.sendActivity('Bye');
            return await step.endDialog();
        }
    } 
       
}

module.exports.MainDialog = MainDialog;
