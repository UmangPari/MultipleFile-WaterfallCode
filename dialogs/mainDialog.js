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
const { DbVisibilityDialog } = require('./dbVisibilityDialog');
const { AppModelDialog} =require('./appModelDialog')

const APPMODEL_DIALOG='appModelDialog'
const DBVISIBILITY_DIALOG ='dbVisibilityDailog';
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
            .addDialog(new AppModelDialog(APPMODEL_DIALOG))
            .addDialog(new DbVisibilityDialog(DBVISIBILITY_DIALOG))
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
            prompt: 'Please choose the intent?',
            choices: ChoiceFactory.toChoices(['appModelDialog', 'dbVisibilityDialog'])
        });
    }

    /**
     * Second step in the waterfall.  This will use LUIS to attempt to extract the origin, destination and travel dates.
     * Then, it hands off to the bookingDialog child dialog to collect any remaining details.
     */
    async actStep(step) 
    {
        
        if(step.result.value=='appModelDialog')
        {
            return await step.beginDialog(APPMODEL_DIALOG);
        }
        else if(step.result.value=='dbVisibilityDialog')
        {
           return await step.beginDialog(DBVISIBILITY_DIALOG);
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
            step.context.sendActivity('Thank you');
            return await step.endDialog();
        }
    } 
       
}

module.exports.MainDialog = MainDialog;
