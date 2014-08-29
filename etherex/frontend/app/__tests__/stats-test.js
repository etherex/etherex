jest.dontMock('../js/stats');
jest.dontMock('lodash');

describe('stats', function() {
 it('sums stats for references', function() {
   var stats = require('../js/stats');
   var references = [
       {
           maxLiability: 10,
           lockedLiability: 0,
       },
       {
           maxLiability: 5,
           lockedLiability: 3,
       }
   ];
   expect(stats.sumReferenceStats(references)).toEqual({
       maxLiabilities: 15,
       lockedLiabilities: 3
   });
 });
});
