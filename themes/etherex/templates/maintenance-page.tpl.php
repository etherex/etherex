<!DOCTYPE html>
<html lang="<?php print $language->language ?>"<?php if (!empty($manifest)): print $manifest; endif; ?>>
<head>
<title><?php print $head_title ?></title><?php print $head ?>
<?php print etherex_styles(array('styles' => $styles)); // $styles ?>
<?php print $scripts; // botsauce_scripts(array('scripts' => $scripts)); ?>
</head>
<body class="<?php print $body_classes; ?>">
<div id="wrapper">
  <div id="page" class="clearfix">
    <header id="header" class="clearfix">
      <hgroup id="logo-and-title">
        <?php if ($logo): ?>
        <a id="logo" href="<?php print check_url($base_path); ?>" title="<?php print check_plain($site_name); ?>">
          <img src="<?php print $logo; ?>" alt="<?php print check_plain($site_name); ?>" />
        </a>
        <?php endif; ?>
        <?php if ($site_name): ?>
        <h1 id="logo_title">
          <a href="<?php print check_url($base_path); ?>" title="<?php print check_plain($site_name); ?>">
            <?php print check_plain($site_name); ?>
          </a>
        </h1>
        <?php endif; ?>
      </hgroup>
    </header> <!-- /#header -->
    <?php print $header; ?>

    <div id="mobile-toggle">
      <a href="#" id="mobile-toggle-menu" class="mobile-sidebar-toggle">
        <i class="btn icon-reorder icon-menu"></i>
      </a>
      <a href="#" id="mobile-toggle-search" class="mobile-sidebar-toggle">
        <i class="btn icon-search"></i>
      </a>
      <a href="#" id="mobile-sidebar-title"><?php print $title; ?></a>
    </div>

    <nav id="nav" class="clearfix">
    <?php if (isset($primary_links)) : ?>
      <?php print theme('links', $primary_links, array('class' => 'links primary-links')) ?>
    <?php endif; ?>
    </nav> <!-- /#nav -->

    <div id="container"<?php print poissonblanc_container_class($left, $right); ?> class="clearfix">

      <?php if ($left): ?>
        <aside id="sidebar-left" class="sidebar">
          <div class="inner-content clearfix">
            <?php // if (isset($secondary_links)) : ?>
              <?php // print theme('links', $secondary_links, array('class' => 'links secondary-links')) ?>
            <?php // endif; ?>
            <?php print $left ?>
          </div> <!-- /#sidebar-left .inner-content -->
        </aside> <!-- /#sidebar-left -->
      <?php endif; ?>

      <section id="center">
        <div class="inner-content clearfix">
          <?php print $breadcrumb; ?>
          <?php if (!empty($above_content)): ?>
          <div class="region-above-content clearfix">
            <?php print $above_content; ?>
          </div>
          <?php endif; ?>
          <?php if ($mission): print '<div id="mission" class="clearfix">'. $mission .'</div>'; endif; ?>
          <?php if ($tabs): print '<div id="tabs-wrapper" class="clearfix clear-block">'; endif; ?>
          <?php if ($title && !$is_front): print '<h1 id="page-title" class="'. ($tabs ? ' with-tabs"' : '"') .'>'. $title .'</h1>'; endif; ?>
          <?php if ($tabs): print '<ul class="tabs primary clearfix">'. $tabs .'</ul></div>'; endif; ?>
          <?php if ($tabs2): print '<ul class="tabs secondary clearfix">'. $tabs2 .'</ul>'; endif; ?>
          <?php if ($show_messages && $messages): print '<div id="messages" class="clearfix">'.$messages.'</div>'; endif; ?>
          <?php print $content ?>
          <?php if (!empty($contactform)) print $contactform; ?>
        </div> <!-- /#sidebar-left .inner-content -->
      </section> <!-- /#center -->

      <?php if ($right): ?>
        <aside id="sidebar-right" class="sidebar">
          <?php if ($right): ?>
            <div class="inner-content clearfix">
              <div id="poissonblanc-search-box" class="clearfix">
                <?php if ($search_box): ?><?php print $search_box ?><?php endif; ?>
              </div>
              <?php print $right ?>
            </div> <!-- /#sidebar-right .inner-content -->
          <?php endif; ?>
        </aside> <!-- /#sidebar-right -->
      <?php endif; ?>

    </div> <!-- /#container -->
    <footer id="footer" class="clearfix">
      <?php print $footer_message ?>
      <?php print $feed_icons ?>
    </footer> <!-- /#footer -->
  </div> <!-- /#page -->
</div>
<?php print $closure ?>
</body>
</html>