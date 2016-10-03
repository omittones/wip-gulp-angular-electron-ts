import * as https from 'https';
import * as _ from 'lodash';
import DigitalOcean = require('do-wrapper');
import DO = DigitalOcean;

const API_KEY = 'e784ba66d663ecd5cddbacec797505ff1ffec72bda0a8b2e4c8a38d9c66f4bf0';

function mapDroplet(droplet: DO.Droplet): Core.IMiner {

    function getIp(droplet: DO.Droplet): string {
        let ip = _.find(droplet.networks.v4, ip => ip.type == 'public');
        return ip ? ip.ip_address : null;
    }

    return {
        id: droplet.id,
        name: droplet.name,
        ip: getIp(droplet),
        status: droplet.status
    };
}

export class MinerQuery implements Core.IQuery<Core.IMiner, {}> {

    private api: DigitalOcean;

    static $inject = ['$http', '$q'];
    constructor(
        private $http: ng.IHttpService,
        private $q: ng.IQService) {
        this.api = new DigitalOcean(API_KEY, 1000);
    }

    public get(request: {}): ng.IPromise<Core.IMiner[]> {

        let defered = this.$q.defer<Core.IMiner[]>();

        this.api.dropletsGetAll('', (err, res, body) => {
            if (!err && body && body.droplets) {
                let trimmed = _.map(body.droplets, mapDroplet);
                defered.resolve(trimmed);
            } else {
                console.log('ERROR: could not load all droplets');
                defered.resolve([]);
            }
        });

        return defered.promise;
    }
}


export class MinerFileQuery implements Core.IQuery<Core.MinerFileRespone, Core.MinerFileRequest> {

    static $inject = ['$http'];
    constructor(private $http: ng.IHttpService) {
    }

    public get(request: Core.MinerFileRequest): ng.IPromise<Core.MinerFileRespone> {
        let url = 'https://' + request.ip + '/' + request.path;
        return this.$http.get<any>(url).then(
            function(response) {
                console.log('received from ' + url);
                return response.data;
            }, function(response) {
                console.log('ERROR: could not receve from ' + url);
                return null;
            });
    }
}