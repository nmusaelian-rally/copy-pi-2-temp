        Ext.define('CustomApp', {               
            extend: 'Rally.app.App',
            componentCls: 'app',
            _newObj : {},
            childrens: [],
            _type : null,
            launch: function() {
                Ext.create('Rally.ui.dialog.ChooserDialog', {
                    width: 450,
                    autoScroll: true,
                    height: 525,
                    title: 'Select to Copy',
                    pageSize: 100,
                    closable: false,
                    selectionButtonText: 'Copy',                  
                    artifactTypes: ['PortfolioItem/Feature','PortfolioItem/Initiative','PortfolioItem/Theme'],
                    autoShow: true,
                    storeConfig:{
                        fetch: ['Name','PortfolioItemTypeName'] 
                    },
                    listeners: {
                        artifactChosen: function(selectedRecord) {
                            childrens = [];
                            this._type = selectedRecord.get('PortfolioItemTypeName');
                            this._newObj = selectedRecord;
                            console.log('this._newObj.data.Children.Count:',this._newObj.data.Children.Count );
                            var self = this;
                            Ext.create('Rally.data.wsapi.Store', {
                                model: 'PortfolioItem/' + selectedRecord.get('PortfolioItemTypeName'),
                                fetch: ['Name', 'FormattedID', 'Children'],
                                pageSize: 1,
                                autoLoad: true,
                                listeners: {
                                    load: function(store, records) {
                                        final_features = [];
                                        Ext.Array.each(records, function(child){
                                            var item = selectedRecord;
                                            childrens = item.getCollection('Children');
                                            childrens.load({
                                                fetch: ['FormattedID'],
                                                callback: function(records, operation, success){
                                                    Ext.Array.each(records, function(portfolioitem){
                                                        if (portfolioitem.get('PortfolioItemTypeName') == "Feature") {
                                                            self._childObj = portfolioitem;
                                                            self._copyChild();
                                                        }   
                                                    }, self);   
                                                },
                                                scope: this 
                                            });     
                                        }, self);
                                    }   
                                }
                            });
                        },
                        scope: this
                    },
                }); 
            },
            // Inner Copy functions
            _copyChild: function() {
                var that = this;
                console.log("in  _copyChild, that._childObj.data.FormattedID:", that._childObj.data.FormattedID); //Uncaught ReferenceError: that is not defined
                this.innerModelRetrieved();
            },
            innerModelRetrieved: function() {
                var that = this;
                (function(){
                    var child = that._childObj;
                    console.log("in innerModelRetrieved, that._childObj.data.FormattedID:", that._childObj.data.FormattedID);
                    that._type = 'PortfolioItem/' + that._childObj.get('PortfolioItemTypeName');
                    Rally.data.ModelFactory.getModel({
                        type: that._type,
                        success: function(model){
                        that.onInnerModelRetrieved(model, child );
                    },
                    scope: that
                });
                })();
                
            },                      
            onInnerModelRetrieved: function(model, _childObj ) {
                console.log("in onInnerModelRetrieved, that._childObj.data.FormattedID:", _childObj.data.FormattedID);
                this.model = model;
            }
});
