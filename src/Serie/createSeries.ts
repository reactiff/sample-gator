import Serie from ".";
import ClosedCircuitBuffer from "../ClosedCircuitBuffer";

export default function createSeries(ccb: ClosedCircuitBuffer) {
    const keys = [
        ...ccb.sampler.fields.publicKeys,
        ...ccb.sampler.fields.expressionKeys,
    ];

    ccb.serieInstances = {};
    const series = {};

    keys.forEach(key => {
        series[key] = () => {
            if (!ccb.serieInstances[key]) {
                ccb.serieInstances[key] = Serie.createSerie(key, ccb);
            }
            return ccb.serieInstances[key];
        }
    })

    const seriesHandler = {
        get: (target, prop, receiver) => {
            try {
                return target[prop]();    
            }
            catch (ex) {
                throw new Error("Tried to access a non-existent Serie: '" + prop + "'");
            }
        }
    };
    
    ccb.series = new Proxy(series, seriesHandler);
}
