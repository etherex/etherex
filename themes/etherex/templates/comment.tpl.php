<article class="comment<?php print ($comment->new) ? ' comment-new' : ''; print ' '. $status; print ' '. $zebra; ?> clearfix">

  <header>
    <?php print $picture ?>
<?php /*
    <h3><?php print $title ?></h3>
*/ ?>
    <span class="submitted"><?php print $submitted; ?></span>

    <?php if ($comment->new) : ?>
      <span class="new"><?php print $new ?></span>
    <?php endif; ?>
  </header>

  <div class="content">
    <?php print $content ?>
    <?php if ($signature): ?>
      <div class="user-signature clearfix">
        <?php print $signature ?>
      </div>
    <?php endif; ?>
  </div>

  <?php if ($links): ?>
    <footer>
      <?php print $links ?>
    </footer>
  <?php endif; ?>

</article> <!-- /.comment -->
