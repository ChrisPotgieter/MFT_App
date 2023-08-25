define(['app'], function(calendar){

    "use strict";


    calendar.registerFactory('CalendarEvent', function($resource){
        return $resource( 'api/events.json', {_id:'@id'})
    })

});