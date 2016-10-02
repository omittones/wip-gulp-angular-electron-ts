import * as dow from 'do-wrapper';
import * as https from 'https';
import * as _ from 'lodash';

const API_KEY = 'e784ba66d663ecd5cddbacec797505ff1ffec72bda0a8b2e4c8a38d9c66f4bf0';

function mapDroplet(droplet: dow.Droplet): Core.IMiner {
    return {
        id: droplet.id,
        name: droplet.name,
        ip: this.getIp(droplet),
        status: droplet.status
    };
}

export class MinerQuery implements Core.IQuery<Core.IMiner, {}> {

    private api: dow.DigitalOcean;

    static $inject = ['$http', '$q'];
    constructor(
        private $http: ng.IHttpService,
        private $q: ng.IQService) {
        this.api = new dow.DigitalOcean(API_KEY, 1000);
    }

    public get(request: {}): ng.IPromise<Core.IMiner[]> {

        let defered = this.$q.defer<Core.IMiner[]>();

        this.api.dropletsGetAll('', (err, res, body) => {
            if (!err && body && body.droplets) {
                var trimmed = _.map(body.droplets, mapDroplet);
                defered.resolve(trimmed);
            } else {
                console.log('ERROR: could not load all droplets');
                defered.resolve([]);
            }
        });

        return defered.promise;
    }

    private getIp(droplet: dow.Droplet): string {
        var ip = _.find(droplet.networks.v4, ip => ip.type == 'public');
        return ip ? ip.ip_address : null;
    }


}


export class MinerFileQuery implements Core.IQuery<Core.MinerFileRespone, Core.MinerFileRequest> {

    private api: dow.DigitalOcean;

    static $inject = ['$http', '$q'];
    constructor(private $http: ng.IHttpService,
        private $q: ng.IQService) {
        this.api = new dow.DigitalOcean(API_KEY, 1000);
    }

    public get(request: Core.MinerFileRequest): ng.IPromise<Core.MinerFileRespone> {

        let defered = this.$q.defer<Core.MinerFileRespone>()

        this.api.dropletsGetById(request.id, (err, res, body) => {
            if (!err && body && body.droplet) {
                var details = mapDroplet(body.droplet);
                this.loadDropletFile(details, request.path, function(url, body) {
                    defered.resolve(body);
                });
            } else {
                console.log('ERROR: could not load single droplet ' + request.id.toString());
                defered.resolve(null);
            }
        });

        return defered.promise;
    }

    private loadDropletFile(details: Core.IMiner, path: string, callback: Action2<string, any>) {
        var url = 'https://' + details.ip + '/' + path;
        var agentOptions = {
            host: details.ip,
            port: '443',
            path: '/' + path,
            rejectUnauthorized: false
        };
        var agent = new https.Agent(agentOptions);

        this.$http.get<any>(url).then(function(body) {
            console.log('received from ' + url);
            callback(url, body);
        }, function(reason) {
            console.log('ERROR: could not receve from ' + url);
            console.log(reason);
            callback(url, null);
        });
    }
}