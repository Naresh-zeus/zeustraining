export class EventManager {
    
    constructor(){
        this.Handlers = [];
        this.currHandler = null;
    }

    RegisterHandler(handler){
        this.Handlers.push(handler);
    }

    pointerUp(e) {
		if (currHandler)
			this.currHandler.pointerUp(e);
		this.currHandler = null;
	}

	pointerdown(e) {
		for (handler in Handlers) {
			if (handler.hitTest(e))
			{
				this.currHandler = handlers;
				break;
			}
		}
		if(currHandler)
			this.currHandler.pointerdown(e);
	}
	
	pointerMove(e) {
		if (currHandler)
			this.currHandler.pointerMove(e);
		else {
			for (handler in eventHandlers) {
				if (handler.hitTest(e))
					break;
			}
		}
    }
}