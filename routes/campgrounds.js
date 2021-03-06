var express         = require( 'express' );
var Campground      = require( '../models/campground' );
var middleware      = require( '../middleware/index' );
var router          = express.Router( { mergeParams: true } );

// INDEX - show all campgrounds
router.get( '/', function( req, res ) {
    // Get all campgrounds from DB
    Campground.find( {}, function( err, allCampgrounds ) {
       if( err ) {
            console.log( err );
       } else {
            res.render( 'campgrounds/index', { campgrounds: allCampgrounds } );
       }
    } );
} );

// CREATE - add new campground to DB
router.post( '/', middleware.isLoggedIn, function( req, res ){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = { name: name, price: price, image: image, description: desc, author: author };

    // Create a new campground and save to DB
    Campground.create( newCampground, function( err, newlyCreated ){
        if( err ){
            console.log( err );
        } else {
            //redirect back to campgrounds page
            console.log( newlyCreated );
            res.redirect( '/campgrounds' );
        }
    } );
} );

// NEW - show form to create new campground
router.get( '/new', middleware.isLoggedIn, function( req, res ) {
   res.render( 'campgrounds/new' ); 
} );

// SHOW - shows more info about one campground
router.get( '/:id', function( req, res ) {
    //find the campground with provided ID
    Campground.findById( req.params.id ).populate( 'comments' ).exec( function( err, foundCampground ) {
        if( err ) {
            console.log( err );
        } else {
            console.log( foundCampground )
            //render show template with that campground
            res.render( 'campgrounds/show', { campground: foundCampground } );
        }
    } );
} );

// EDIT - shows the form to edit the campground
router.get( '/:id/edit', middleware.checkCampgroundOwnership,  function( req, res ) { 
    if ( req.isAuthenticated ) {
        Campground.findById( req.params.id, function( err, foundCampground ) {
            if ( err ) {
                res.redirect( '/campgrounds' );
            } else {
                res.render( 'campgrounds/edit', { campground: foundCampground } );
            }
        } );
    }
} );

// UPDATE - route to submit the edit form
router.put( '/:id', middleware.checkCampgroundOwnership, function( req, res ) {
    Campground.findByIdAndUpdate( req.params.id, req.body.campground, function( err, updatedCampground ) {
        if ( err ) {
            res.redirect( '/campgrounds' );
        } else {
            res.redirect( '/campgrounds/' + req.params.id );
        }
    } );
} );

// DESTROY = route to delete teh campground
router.delete( '/:id', middleware.checkCampgroundOwnership, function( req, res ) { 
    Campground.findByIdAndRemove( req.params.id, function( err ) {
        if ( err ) {
            res.redirect( '/campgrounds' );
        } else {
            req.flash( 'success', "Campground Successfully Deleted!" );
            res.redirect( '/campgrounds' );
        }
    } );
} );

module.exports = router;