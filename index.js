const connect = require('./mysql_connect');
const connect_discord = require('./discord_connect');
const { MessageActionRow, MessageEmbed, MessageButton, MessageSelectMenu } = require('discord.js');

setTimeout(initialisation, 3000);
let array_whitelist = [];
let array_terms = [];
let array_points = [];
let array_type = [];

/* Récupération des sites et termes avec leurs points */
function initialisation() {
    console.log("\033[32mL'app est prête à être utilisée\033[37m.");

    /* Récupération des sites whitelistés */
    const recuperationSite = "SELECT * FROM whitelistsw";
    connect.query(recuperationSite, function(err, result) {
        if (err) {
            console.log("Erreur dans la récupération des sites whitlistés. > " + err);
        }
        while (array_whitelist.length < result.length) {
            array_whitelist.push(result[array_whitelist.length].idwhitelistsw);
        }
    });

    /* Récupération des termes */
    const recuperationTerms = "SELECT `terms` FROM whitelistterms ORDER BY `id`";
    connect.query(recuperationTerms, function(err, result) {
        if (err) {
            console.log("Erreur dans la récupération des termes. > " + err);
        }
        for (count = 0; count < result.length; count++) {
            array_terms.push(result[count].terms);
        }
    });

    /* Récupération des points */
    const recuperationPoints = "SELECT `points` FROM whitelistterms ORDER BY `id`";
    connect.query(recuperationPoints, function(err, result) {
        if (err) {
            console.log("Erreur dans la récupération des points. > " + err);
        }
        for (count = 0; count < result.length; count++) {
            array_points.push(result[count].points);
        }
    });

    /* Récupération des types de produits */
    const recuperationType = "SELECT `type` FROM whitelistterms ORDER BY `id`";
    connect.query(recuperationType, function(err, result) {
        if (err) {
            console.log("Erreur dans la récupération des types de produit. > " + err);
        }
        for (count = 0; count < result.length; count++) {
            array_type.push(result[count].type);
        }
    });
}

/* Récupération message pour ajout d'une URL */
const prefixAddUrl = "!addurl";
const idChannel = process.env.CHANNEL_ID_ONE;

connect_discord.on('message', searchTerms => {
    const author = searchTerms.author.username;
    if (searchTerms.content.startsWith(prefixAddUrl) && searchTerms.content.length > 20 && searchTerms.content.length < 256) {
        const deletePrefix = searchTerms.content.substring(prefixAddUrl.length);
        const splitMessage = deletePrefix.split(" ").join("");
        if (splitMessage.indexOf("https://") != -1 ) {
            for (compareSite in array_whitelist) {
                if (splitMessage.indexOf(array_whitelist[compareSite]) != -1) {
                    const nameSite = array_whitelist[compareSite];
                    searchTermsInUrl(author, nameSite, splitMessage);
                    break;
                } else if (compareSite == array_whitelist.length-1) {
                    error3(author);
                }
            }
        } else if (splitMessage.indexOf("https://") == -1) {
        error2(author);
        }
    } else if (searchTerms.content.startsWith(prefixAddUrl) && searchTerms.content.length < 20 || searchTerms.content.length > 256) {
        error1(author);
    }
});

/* Détection des mots clefs dans l'url envoyée par l'utilisateur */
function searchTermsInUrl(author, nameSite, splitMessage) {
    let array_findTerms = [];
    let array_pointsTerms = [];
    let array_findType = [];
    let find = false;
    for (compareTerms in array_terms) {
        if (splitMessage.indexOf(array_terms[compareTerms]) != -1) {
            array_findTerms.push(array_terms[compareTerms]);
            array_pointsTerms.push(array_points[compareTerms]);
            array_findType.push(array_type[compareTerms]);
            find = true;
        } else if (compareTerms == array_terms.length-1 && find == false) {
            error4(author, nameSite);
        } 
        if (compareTerms == array_terms.length-1 && find == true) {
            let maxPoints = Math.max(...array_pointsTerms);
            let findMaxPoints = false;
            for (searchPoint = 0; searchPoint < array_pointsTerms.length; searchPoint++) {
                let array_findMaxPoints = [];
                let array_findTypeOfProduct = [];
                if (array_pointsTerms.indexOf(maxPoints) != -1) {
                    array_findMaxPoints.push(array_findTerms[searchPoint]);
                    array_findTypeOfProduct.push(array_findType[searchPoint]);
                    findMaxPoints = true;
                }
                if (findMaxPoints == true && searchPoint == array_pointsTerms.length-1) {
                    succes1(author, nameSite, splitMessage, array_findMaxPoints, array_findTypeOfProduct);
                    console.log("Identification du produit : OK.");
                }
            }
        }
        //console.log(array_findTerms + "/" + array_pointsTerms + "/" + array_findType);
    }
}

/* Messages d'erreur ou succès */
// Longueur de l'url inférieur à 20 ou supérieur à 256 caractères
function error1(author) {
    const err1 = new MessageEmbed()
    .setColor("RED")
    .setTitle("Longueur de l'url incorrect !")
    .setDescription("L'url doit contenir entre 20 et 256 carractères.")
    .setAuthor(author);
    connect_discord.channels.cache.get(idChannel).send({ embeds : [err1] });
}

// L'url ne contient pas de https://
function error2(author) {
    const err2 = new MessageEmbed()
    .setColor("DARK_ORANGE")
    .setTitle("Url invalide !")
    .setDescription("L'url doit commencer par https://.")
    .setAuthor(author);
    connect_discord.channels.cache.get(idChannel).send({ embeds : [err2] }); 
}

// Le site n'est pas whitelisté
function error3(author) {
    const err3 = new MessageEmbed()
    .setColor("ORANGE")
    .setTitle("Le site n'est pas whitelisté !")
    .setDescription("Votre url ne peut pas être ajoutée car le site n'est pas référencé dans la base de données.")
    .setAuthor(author);
    connect_discord.channels.cache.get(idChannel).send({ embeds : [err3] }); 
}

// Le site est whitelisté mais aucun terme n'a été trouvé
function error4(author, nameSite) {
    const err4 = new MessageEmbed()
    .setColor("YELLOW")
    .setTitle("Aucun produit n'a été trouvé !")
    .setDescription("Le site a bien été détecté ("+ nameSite + ") et est dans la whitelist, mais nous ne parvenons pas à trouver le type de produit. L'url n'a donc pas été ajoutée.")
    .setAuthor(author);
    connect_discord.channels.cache.get(idChannel).send({ embeds : [err4] }); 
}

// Le site a été trouvé et au moins un produit a été identifé */
function succes1(author, nameSite, splitMessage, array_findMaxPoints, array_findTypeOfProduct) {
    const btn1 = new MessageActionRow()
    .addComponents(
        new MessageSelectMenu()
        .setCustomId('select')
        .setPlaceholder('Je me suis trompé ?')
        .addOptions([
            { label: "Coffret", description: 'Coffret uniquement.', value: 'opt_1', },
            { label: "Coffret dresseur d'élite", description: 'ETB uniquement.', value: 'opt_2', },
            { label: "Deck", description: 'Necessaire de dresseur, deck, coffret académie.', value: 'opt_3', },
            { label: "Display", description: 'Display scellé ou boite de 36 boosters (cartons).', value: 'opt_4', },
            { label: "Booster", description: "Booster à l'unité ou artset.", value: 'opt_5', },
            { label: "Duopack", description: 'Duopack uniquement.', value: 'opt_6', },
            { label: "Tripack", description: 'Tripack uniquement.', value: 'opt_7', },
            { label: "Pokébox", description: 'Pokébox ou lot de pokébox.', value: 'opt_8', },
            { label: "Pokéball", description: 'Pokéball uniquement.', value: 'opt_9', },
            { label: "Valisette", description: 'Valisette uniquement.', value: 'opt_10', },
            { label: "Mini-tins", description: "Mini-tins à l'unité, en lot ou en display.", value: 'opt_11', },
        ]),
    );

    const btn2 = new MessageActionRow()
    .addComponents(
        new MessageButton()
        .setCustomId('cancel')
        .setLabel('Annuler')
        .setStyle('DANGER')
    );

    const succ1 = new MessageEmbed()
    .setColor("GREEN")
    .setTitle("Nous avons identifié le produit !")
    .setDescription("Il semblerait que le site soit : " + nameSite + " et que le produit soit le suivant : " + array_findTypeOfProduct + ". Votre url est : " + splitMessage)
    .setAuthor(author);
    connect_discord.channels.cache.get(idChannel).send({ embeds: [succ1], components: [btn1, btn2] });

    /* Intéraction avec le bouton et menu à dev */
}