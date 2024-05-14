function Place(place) {
    const id_lugar = place.getElementsByTagName("id_lugar");
    if(id_lugar.length > 0) {
	this.id = parseInt(id_lugar[0].textContent);
    } else {
	throw new Error("No id");
    }
    const nom_orig = place.getElementsByTagName("nom_orig");
    if(nom_orig.length > 0) {
	this.originalName = nom_orig[0].textContent;
    } else {
	this.originalName = "Nombre original no disponible";
    }

    const nom_mod = place.getElementsByTagName("nom_mod");
    if(nom_mod.length > 0) {
	this.modernName = nom_mod[0].textContent;
    } else {
	this.modernName = "Nombre moderno no disponible";
    }

    const merindad = place.getElementsByTagName("merindad");
    if(merindad.length > 0) {
	this.merindad = merindad[0].textContent;
    } else {
	this.merindad = "Merindad no disponible";
    }

    const cat = place.getElementsByTagName("cat_srial");
    if(cat.length > 0) {
	this.category = cat[0].textContent;
    } else {
	this.category = "Categoría no disponible";
    }

    const ref = place.getElementsByTagName("ref");
    if(ref.length > 0) {
	this.ref = ref[0].textContent;
    } else {
	this.ref = "Referencia no disponible";
    }

    const x = place.getElementsByTagName("X");
    if(x.length > 0) {
	this.x = parseInt(x[0].textContent);
    }

    const y = place.getElementsByTagName("Y");
    if(y.length > 0) {
	this.y = parseInt(y[0].textContent);
    }

    if(this.x && this.y) {
	const coord = proj4("EPSG:23030", "EPSG:4326", [this.x, this.y]);
	this.x = coord[0];
	this.y = coord[1];
    }
    
    const notas = place.getElementsByTagName("notas");
    if(notas.length > 0) {
	this.notas = notas[0].textContent;
    } else {
	this.notas = "";
    }

    const not_ed = place.getElementsByTagName("not_ed");
    if(not_ed.length > 0) {
	this.notas += "\n\n" + not_ed[0].textContent;
    }
    
    this.marker = null;

    this.search = this.originalName.toLowerCase() + this.modernName.toLowerCase() + this.notas.toLowerCase();

    return this;
}

function $(id) {
    return document.getElementById(id);
}

function main() {
    const places = [];
    const map = L.map("map").setView([42.3464, -3.7244], 8);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
	maxZoom: 19,
	attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
    }).addTo(map);

    proj4.defs("EPSG:23030","+proj=utm +zone=30 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs +type=crs");
    proj4.defs("EPSG:4230","+proj=longlat +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +no_defs +type=crs");
    proj4.defs("EPSG:4326","+proj=longlat +datum=WGS84 +no_defs +type=crs");

    const xhr = new XMLHttpRequest();
    xhr.open("GET", "Lugares_LBB.xml");
    xhr.addEventListener("load", () => {
	const xmlPlaces = xhr.responseXML.getElementsByTagName("Lugares_LBB");
	for(let xmlPlace of xmlPlaces) {
	    places.push(new Place(xmlPlace));
	}
	for(let place of places) {
	    if(place.x && place.y) {
		place.marker = L.marker([place.y, place.x]).addTo(map);
		place.marker.bindPopup(place.originalName);
		place.marker.on("click", () => {
		    $("original-name").textContent = place.originalName;
		    $("modern-name").textContent = place.modernName;
		    $("cat").textContent = place.category;
		    $("merindad").textContent = place.merindad;
		    $("ref").textContent = place.ref;
		    $("notas").textContent = place.notas;
		});
	    }
	}

	$("search").addEventListener("input", () => {
	    const searchValue = $("search").value.toLowerCase();
   	    $("search-results").innerHTML = "";
	    if(searchValue.length > 0) {
		places
		    .filter((p) => p.search.includes(searchValue))
		    .forEach((p) => {
			const link = document.createElement("span");
			link.textContent = p.originalName;
			link.addEventListener("click", () => {
			    p.marker.openPopup();
			    map.flyTo([p.y, p.x], 14);
			    $("original-name").textContent = p.originalName;
			    $("modern-name").textContent = p.modernName;
			    $("cat").textContent = p.category;
			    $("merindad").textContent = p.merindad;
			    $("ref").textContent = p.ref;
			    $("notas").textContent = p.notas;
			    $("search").value = "";
			    $("search-results").innerHTML = "";
			});
			$("search-results").appendChild(link);
		    });
		
	    }
	});
    });
    xhr.send();
}

window.addEventListener("load", main);
