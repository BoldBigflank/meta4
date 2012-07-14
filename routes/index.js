
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express', uuid: req.session.uuid })
};

exports.game = function(req, res){
    res.render('game', { title: 'Game', user: { name:'Alex' } })
}