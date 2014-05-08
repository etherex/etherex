<?php

// function etherex_theme($existing, $type, $theme, $path) {
//   return array(
//     'username' => array(
//       'arguments' => array($existing),
//     ),
//   );
// }

// function etherex_preprocess_views_view__projects(&$vars) {
// }


function etherex_preprocess_page(&$vars) {
  $vars['head'] = str_replace('ZeroGox', 'EtherEx', $vars['head']);
  $vars['head'] = str_replace('<meta name="msapplication-config" content="/sites/zerogox.com/themes/zerogox/browserconfig.xml"/>' . "\n", '', $vars['head']);
  $vars['head'] = str_replace('353535', '05050F', $vars['head']);
  $vars['head'] = str_replace("\n" . '<link href="//fonts.googleapis.com/css?family=Cinzel:400,700" rel="stylesheet" type="text/css">', "<link href='//fonts.googleapis.com/css?family=Muli:400,300' rel='stylesheet' type='text/css'>", $vars['head']);
  // $vars['head'] = str_replace('<link href="//fonts.googleapis.com/css?family=Open+Sans:300,300italic,400,400italic,600,600italic,700,700italic,800,800italic&subset=latin" rel="stylesheet" type="text/css" />'. "\n", '', $vars['head']);
  // drupal_set_html_head('<link href="//fonts.googleapis.com/css?family=Open+Sans:300,300italic,600,600italic,700,700italic&subset=latin" rel="stylesheet" type="text/css" />');


  // if ($vars['is_front']) {
  //   $vars['head_title'] = implode(' | ', array(
  //     variable_get('site_slogan', ''),
  //     variable_get('site_name', 'Drupal')
  //   ));
  // }

  // Cha[r]t
  // if (arg(0) == 'node' && arg(1) == 30 || drupal_get_path_alias() == 'chart') {
  //   $path = drupal_get_path('module', 'zerobot');
  //   drupal_add_js($path . '/mousetrap.min.js', 'theme', 'header');
  //   drupal_add_js($path . '/zerobot-charts.js', 'theme', 'header');
  //   // $vars['templates'][] = 'chart';
  // }

  // $vars['body_classes'] = '';

  // if (!empty($vars['node'])) {
  //   $vars['body_classes'] .= 'type-' . $vars['node']->type;
  // }

  // if ($vars['is_front']) {
  //   $vars['body_classes'] .= ' front';
  // }

  // $vars['body_classes'] .= ' section-' . basename(url($_GET['q']));

  // // WTF secondary tabs
  // $vars['tabs2'] = menu_secondary_local_tasks();


  // $css = drupal_add_css();
  // Similar process for CSS but there are 2 Css realted variables.
  //  $variables['css'] and $variables['styles'] are both used.
  // if (!empty($variables['css'])) {
  //   $path = drupal_get_path('module', 'admin_menu');
  //   unset($css['all']['module'][$path . '/admin_menu.css']);
  //   unset($css['all']['module'][$path . '/admin_menu.color.css']);
  //   $variables['styles'] = drupal_get_css($css);
  // }

  // dpm($vars);
}

// function etherex_preprocess_node(&$vars) {
  // if ($vars['type'] == 'page' && !empty($vars['template_files'][0])) {
  //   $vars['template_files'][0] = 'node-blog';
  // }
  // if ($vars['type'] == 'project') {
// dpm($vars);
  // }
// }

function etherex_scripts($vars) {
  $scripts = drupal_add_js();
  // dpm($scripts);

  if (!empty($vars['scripts'])) {
    // $path = drupal_get_path('module', 'admin_menu');
    unset($scripts['theme']['themes/poissonblanc/scripts/features.js']);
    // dpm($scripts);
    // $vars['scripts'] = drupal_get_js('header', $scripts);
  }
  return drupal_get_js('header', $scripts);
}

function etherex_styles($vars) {
  $styles = drupal_add_css();
  // dpm($styles);

  if (!empty($vars['styles'])) {
    // $path = drupal_get_path('module', 'admin_menu');
    // unset($styles['all and (max-width: 1023px)']['theme']['themes/poissonblanc/styles/adaptive/tablet.css']);
    // unset($styles['all and (max-width: 1023px)']['theme']['sites/snapci.com/themes/poissonblanc/styles/adaptive/tablet.css']);
    unset($styles['all and (max-width: 767px)']['theme']['themes/poissonblanc/styles/adaptive/mobile-landscape.css']);
    unset($styles['all and (max-width: 767px)']['theme']['themes/botsauce/styles/adaptive/mobile-landscape.css']);
    unset($styles['all and (max-width: 767px)']['theme']['sites/etherex.com/themes/poissonblanc/styles/adaptive/mobile-landscape.css']);
    unset($styles['all and (max-width: 479px)']['theme']['themes/poissonblanc/styles/adaptive/mobile-portrait.css']);
    unset($styles['all and (max-width: 479px)']['theme']['themes/botsauce/styles/adaptive/mobile-portrait.css']);
    unset($styles['all and (max-width: 479px)']['theme']['sites/etherex.com/themes/poissonblanc/styles/adaptive/mobile-portrait.css']);
    // dpm($scripts);
    // $vars['scripts'] = drupal_get_js('header', $scripts);
  }
  return drupal_get_css($styles);
}
