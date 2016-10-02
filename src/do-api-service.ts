import * as dow from 'do-wrapper';
import * as https from 'https';
import * as _ from 'lodash';

export interface SimpleDroplet {
    id: number;
    ip: string;
    name: string;
    status: string;
}

export class DOApiService {

    private api: dow.DigitalOcean;

    constructor(private $http: ng.IHttpService) {
        this.api = new dow.DigitalOcean('e784ba66d663ecd5cddbacec797505ff1ffec72bda0a8b2e4c8a38d9c66f4bf0', 1000);
    }

    public getDroplet(callback: any) {
        this.api.dropletsGetAll('', (err, res, body) => {
            if (!err && body && body.droplets) {
                var trimmed = _.map(body.droplets, this.trimDroplet);
                callback(trimmed);
            } else {
                console.log('ERROR: could not load all droplets');
                callback([]);
            }
        });
    }

    public getDroplets(id: number, document: string, callback: any) {
        this.api.dropletsGetById(id, (err, res, body) => {
            if (!err && body && body.droplet) {
                var details = this.trimDroplet(body.droplet);
                this.loadDropletFile(details, document, function(url, body) {
                    callback(body);
                });
            } else {
                console.log('ERROR: could not load single droplet ' + id.toString());
                callback(null);
            }
        });
    }

    private loadDropletFile(details: SimpleDroplet, path: string, callback: Action2<string, any>) {
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

    private getIp(droplet: dow.Droplet): string {
        var ip = _.find(droplet.networks.v4, ip => ip.type == 'public');
        return ip ? ip.ip_address : null;
    }

    private trimDroplet(droplet: dow.Droplet): SimpleDroplet {
        return {
            id: droplet.id,
            name: droplet.name,
            ip: this.getIp(droplet),
            status: droplet.status
        };
    }
}
