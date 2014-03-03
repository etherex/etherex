<?php // if (!$page): ?>
  <article id="node-<?php print $node->nid; ?><?php if ($teaser) { print '-teaser'; } ?>" class="node<?php if ($sticky) { print ' sticky'; } ?><?php if (!$status) { print ' node-unpublished'; } ?> clearfix">
<?php // endif; ?>

  <?php if ($picture || $submitted || !$page): ?>
    <?php if (!$page): ?>
      <header>
  <?php endif; ?>

      <?php print $picture ?>

    <?php if (!$page): ?>
        <h2><a href="<?php print $node_url ?>" title="<?php print $title ?>"><?php print $title ?></a></h2>
      <?php endif; ?>

    <?php if ($submitted): ?>
        <span class="submitted"><?php print $submitted; ?></span>
    <?php endif; ?>

    <?php if (!$page): ?>
      </header>
  <?php endif; ?>
  <?php endif;?>

  <div class="content">
    <?php print $content ?>
  </div>

  <?php if (!empty($terms)): ?>
    <footer class="meta clearfix">
      <?php if ($terms): ?>
        <div class="terms">
          <?php print $terms ?>
        </div>
      <?php if (!empty($links)): ?>
        <div class="links">
          <?php print $links; ?>
        </div>
      <?php endif; ?>
      <?php endif;?>
    </footer>
  <?php endif;?>

<?php // if (!$page): ?>
  </article> <!-- /.node -->
<?php // endif;?>
