# Cell 3 — Class name normalisation map (covers all 4 datasets)
NAME_MAP = {
    # bacterial_leaf_blight
    'bacterial_leaf_blight':   'bacterial_leaf_blight',
    'bacterialblight':         'bacterial_leaf_blight',
    'bacterial blight':        'bacterial_leaf_blight',
    'bacterial_blight':        'bacterial_leaf_blight',
    'bacterial leaf blight':   'bacterial_leaf_blight',  # RiceLeafBD + vbookshelf
    'rice___bacterial_blight': 'bacterial_leaf_blight',  # PlantVillage
    'bb':                      'bacterial_leaf_blight',
    # brown_spot
    'brown_spot':              'brown_spot',
    'brownspot':               'brown_spot',
    'brown spot':              'brown_spot',
    'rice___brown_spot':       'brown_spot',             # PlantVillage
    'bs':                      'brown_spot',
    # leaf_blast
    'leaf_blast':              'leaf_blast',
    'leafblast':               'leaf_blast',
    'blast':                   'leaf_blast',
    'rice_blast':              'leaf_blast',
    'leaf smut':               'leaf_blast',             # vbookshelf
    'leafsmut':                'leaf_blast',
    'rice___blast':            'leaf_blast',             # PlantVillage
    # tungro
    'tungro':                  'tungro',
    'tungro virus':            'tungro',                 # RiceLeafBD
    'rice_tungro':             'tungro',
    'rice___tungro':           'tungro',                 # PlantVillage
    # healthy
    'healthy':                 'healthy',
    'healthy leaf':            'healthy',                # RiceLeafBD
    'normal':                  'healthy',
    # not_rice_leaf (only from staging — not collected by collect())
    'not_rice_leaf':           'not_rice_leaf',
}
